"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection as RFConnection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
  ReactFlowInstance,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { useEditorStore, DEFAULT_CONNECTION_KIND } from "@/lib/store";
import type {
  Diagram,
  Element as ArcadiaElement,
  Connection as ArcadiaConnection,
  ElementKind,
} from "@/domain/entities";
import { ValidationEngine } from "@/domain/services/ValidationEngine";
import { ArcadiaNode, type ArcadiaNodeData } from "./ArcadiaNode";

// ----------------------------------------------------------------
// Node types registration (must be stable reference)
// ----------------------------------------------------------------

const NODE_TYPES = { arcadia: ArcadiaNode };

// ----------------------------------------------------------------
// Converters
// ----------------------------------------------------------------

function elementToNode(el: ArcadiaElement): Node<ArcadiaNodeData> {
  return {
    id: el.id,
    type: "arcadia",
    position: el.position,
    data: { kind: el.kind, name: el.name },
    style: { width: el.size?.width ?? 160 },
  };
}

function connectionToEdge(conn: ArcadiaConnection): Edge {
  return {
    id: conn.id,
    source: conn.sourceId,
    target: conn.targetId,
    label: conn.label,
    animated: conn.kind === "RealizationLink",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  };
}

// ----------------------------------------------------------------
// Main component (keyed externally by diagramId to reset state)
// ----------------------------------------------------------------

interface DiagramEditorProps {
  diagram: Diagram | null;
}

export default function DiagramEditor({ diagram }: DiagramEditorProps) {
  if (!diagram) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm text-neutral-400">هیچ دیاگرامی انتخاب نشده</p>
      </div>
    );
  }

  return <DiagramCanvas key={diagram.id} diagram={diagram} />;
}

// ----------------------------------------------------------------
// Canvas component
// ----------------------------------------------------------------

function DiagramCanvas({ diagram }: { diagram: Diagram }) {
  // Store selectors
  const storeElements = useEditorStore((s) =>
    s.elements.filter((e) => e.diagramId === diagram.id)
  );
  const storeConnections = useEditorStore((s) =>
    s.connections.filter((c) => c.diagramId === diagram.id)
  );
  const allElements = useEditorStore((s) => s.elements);
  const allConnections = useEditorStore((s) => s.connections);
  const updateElementPosition = useEditorStore((s) => s.updateElementPosition);
  const addElementToStore = useEditorStore((s) => s.addElement);
  const addConnectionToStore = useEditorStore((s) => s.addConnection);
  const selectElement = useEditorStore((s) => s.selectElement);
  const deleteElementFromStore = useEditorStore((s) => s.deleteElement);
  const deleteConnectionFromStore = useEditorStore((s) => s.deleteConnection);

  // Local React Flow state
  const [nodes, setNodes] = useState<Node[]>(() =>
    storeElements.map(elementToNode)
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    storeConnections.map(connectionToEdge)
  );

  // Track store element count to sync new drops
  const prevElCount = useRef(storeElements.length);
  const prevConnCount = useRef(storeConnections.length);

  useEffect(() => {
    if (storeElements.length !== prevElCount.current) {
      prevElCount.current = storeElements.length;
      setNodes(storeElements.map(elementToNode));
    }
  }, [storeElements]);

  useEffect(() => {
    if (storeConnections.length !== prevConnCount.current) {
      prevConnCount.current = storeConnections.length;
      setEdges(storeConnections.map(connectionToEdge));
    }
  }, [storeConnections]);

  // React Flow instance for coordinate conversion
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // ---- Node change handler (drag / select) ----
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  // ---- Edge change handler ----
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);

  // ---- Persist position on drag stop ----
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateElementPosition(node.id, node.position.x, node.position.y);
    },
    [updateElementPosition]
  );

  // ---- Connect handler with validation ----
  const onConnect = useCallback(
    (connection: RFConnection) => {
      if (!connection.source || !connection.target) return;

      const sourceEl = allElements.find((e) => e.id === connection.source);
      const targetEl = allElements.find((e) => e.id === connection.target);
      if (!sourceEl || !targetEl) return;

      const connKind = DEFAULT_CONNECTION_KIND[diagram.type];

      // Quick validation
      const allowed = ValidationEngine.isConnectionAllowed(
        sourceEl.kind,
        targetEl.kind,
        connKind
      );
      if (!allowed) {
        alert(
          `اتصال از نوع «${connKind}» بین «${sourceEl.kind}» و «${targetEl.kind}» مجاز نیست.`
        );
        return;
      }

      const newConn: ArcadiaConnection = {
        id: crypto.randomUUID(),
        modelId: diagram.modelId,
        diagramId: diagram.id,
        sourceId: connection.source,
        targetId: connection.target,
        kind: connKind,
        label: "",
        exchangeItemIds: [],
        properties: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addConnectionToStore(newConn);
      setEdges((prev) =>
        addEdge(
          {
            ...connection,
            id: newConn.id,
            animated: connKind === "RealizationLink",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { strokeWidth: 2 },
          },
          prev
        )
      );
    },
    [allElements, diagram, addConnectionToStore]
  );

  // ---- Select node ----
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectElement(node.id);
    },
    [selectElement]
  );

  // ---- Deselect on pane click ----
  const onPaneClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  // ---- Delete key handler ----
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        nodes.forEach((n) => {
          if (n.selected) deleteElementFromStore(n.id);
        });
        edges.forEach((ed) => {
          if (ed.selected) deleteConnectionFromStore(ed.id);
        });
      }
    },
    [nodes, edges, deleteElementFromStore, deleteConnectionFromStore]
  );

  // ---- Drag-from-palette: drop onto canvas ----
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(
        "application/arcadia-kind"
      ) as ElementKind;
      if (!kind) return;

      const position = rfInstance?.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      }) ?? { x: 100, y: 100 };

      const newEl: ArcadiaElement = {
        id: crypto.randomUUID(),
        modelId: diagram.modelId,
        diagramId: diagram.id,
        kind,
        name: kind,
        position,
        size: { width: 160, height: 60 },
        realizationIds: [],
        properties: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addElementToStore(newEl);
    },
    [rfInstance, diagram, addElementToStore]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="h-full w-full"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
