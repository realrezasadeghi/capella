"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection as RFConnection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
  MarkerType,
  ReactFlowInstance,
  useReactFlow,
  useNodes,
  useEdges,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  ZoomIn, ZoomOut, Maximize2, Trash2,
  ShieldCheck, AlertCircle, AlertTriangle,
} from "lucide-react";

import { useEditorStore, DEFAULT_CONNECTION_KIND } from "@/lib/store";
import type {
  Diagram,
  Element as ArcadiaElement,
  Connection as ArcadiaConnection,
  ElementKind,
} from "@/domain/entities";
import { ValidationEngine } from "@/domain/services/ValidationEngine";
import { ArcadiaNode, type ArcadiaNodeData } from "./ArcadiaNode";
import { ArcadiaEdge, type ArcadiaEdgeData } from "./ArcadiaEdge";

// ----------------------------------------------------------------
// Node/Edge types — stable references (must be outside component)
// ----------------------------------------------------------------

const NODE_TYPES = { arcadia: ArcadiaNode };
const EDGE_TYPES = { arcadia: ArcadiaEdge };

// ----------------------------------------------------------------
// Converters
// ----------------------------------------------------------------

function elementToNode(
  el: ArcadiaElement,
  errorIds: Set<string>,
  highlightIds: Set<string>,
  chainIds: Set<string>
): Node<ArcadiaNodeData> {
  return {
    id: el.id,
    type: "arcadia",
    position: el.position,
    data: {
      elementId: el.id,
      kind: el.kind,
      name: el.name,
      hasError: errorIds.has(el.id),
      isInTraceChain: highlightIds.has(el.id),
      isInFunctionalChain: chainIds.has(el.id),
    },
    style: { width: el.size?.width ?? 160 },
  };
}

function connectionToEdge(
  conn: ArcadiaConnection,
  allElements: ArcadiaElement[],
  chainIds: Set<string>
): Edge<ArcadiaEdgeData> {
  const isChain = chainIds.has(conn.sourceId) && chainIds.has(conn.targetId);
  const exchangeItems = conn.exchangeItemIds
    .map((id) => allElements.find((e) => e.id === id)?.name ?? id)
    .filter(Boolean);

  return {
    id: conn.id,
    source: conn.sourceId,
    target: conn.targetId,
    type: "arcadia",
    markerEnd: { type: MarkerType.ArrowClosed },
    data: {
      connectionKind: conn.kind,
      label: conn.label || undefined,
      exchangeItems,
      isChainHighlighted: isChain,
      isRealization: conn.kind === "RealizationLink",
    },
  };
}

// ----------------------------------------------------------------
// Canvas Toolbar — inside <ReactFlow> for useReactFlow access
// ----------------------------------------------------------------

function CanvasToolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  const deleteElement    = useEditorStore((s) => s.deleteElement);
  const deleteConnection = useEditorStore((s) => s.deleteConnection);
  const runValidation    = useEditorStore((s) => s.runValidation);
  const validationResults = useEditorStore((s) => s.validationResults);

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const hasSelection  = selectedNodes.length > 0 || selectedEdges.length > 0;

  const errorCount = validationResults.filter((r) => r.severity === "error").length;
  const warnCount  = validationResults.filter((r) => r.severity === "warning").length;

  const handleDelete = () => {
    selectedNodes.forEach((n) => deleteElement(n.id));
    selectedEdges.forEach((e) => deleteConnection(e.id));
  };

  const btn = "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors";

  return (
    <Panel position="top-center">
      <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 shadow-md">
        <button title="Fit View" onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}>
          <Maximize2 size={14} /><span>Fit</span>
        </button>
        <button title="Zoom In" onClick={() => zoomIn({ duration: 200 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}>
          <ZoomIn size={14} />
        </button>
        <button title="Zoom Out" onClick={() => zoomOut({ duration: 200 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}>
          <ZoomOut size={14} />
        </button>

        <div className="mx-1 h-4 w-px bg-neutral-200" />

        <button title="Delete selected (Del)" onClick={handleDelete} disabled={!hasSelection}
          className={`${btn} ${hasSelection ? "text-red-600 hover:bg-red-50" : "cursor-not-allowed text-neutral-300"}`}>
          <Trash2 size={14} /><span>Delete</span>
          {hasSelection && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              {selectedNodes.length + selectedEdges.length}
            </span>
          )}
        </button>

        <div className="mx-1 h-4 w-px bg-neutral-200" />

        {/* Validate — opens ValidationBar panel */}
        <button title="Validate model" onClick={runValidation}
          className={`${btn} text-blue-600 hover:bg-blue-50`}>
          <ShieldCheck size={14} /><span>Validate</span>
          {errorCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              {errorCount}
            </span>
          )}
          {errorCount === 0 && warnCount > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
              {warnCount}
            </span>
          )}
        </button>
      </div>
    </Panel>
  );
}


// ----------------------------------------------------------------
// Public DiagramEditor
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
// DiagramCanvas
// ----------------------------------------------------------------

function DiagramCanvas({ diagram }: { diagram: Diagram }) {
  const storeElements    = useEditorStore((s) => s.elements.filter((e) => e.diagramId === diagram.id));
  const storeConnections = useEditorStore((s) => s.connections.filter((c) => c.diagramId === diagram.id));
  const allElements      = useEditorStore((s) => s.elements);
  const validationResults     = useEditorStore((s) => s.validationResults);
  const crossViewHighlightIds = useEditorStore((s) => s.crossViewHighlightIds);
  const highlightedChainIds   = useEditorStore((s) => s.highlightedChainIds);

  const updateElementPosition = useEditorStore((s) => s.updateElementPosition);
  const addElementToStore     = useEditorStore((s) => s.addElement);
  const addConnectionToStore  = useEditorStore((s) => s.addConnection);
  const selectElement         = useEditorStore((s) => s.selectElement);
  const clearFocus            = useEditorStore((s) => s.clearFocus);
  const focusElementId        = useEditorStore((s) => s.focusElementId);

  const errorElementIds = useMemo(
    () => new Set(validationResults.map((r) => r.elementId).filter(Boolean) as string[]),
    [validationResults]
  );

  const highlightSet = useMemo(
    () => new Set(crossViewHighlightIds),
    [crossViewHighlightIds]
  );

  const chainSet = useMemo(
    () => new Set(highlightedChainIds),
    [highlightedChainIds]
  );

  // Local React Flow state
  const [nodes, setNodes] = useState<Node[]>(() =>
    storeElements.map((el) => elementToNode(el, errorElementIds, highlightSet, chainSet))
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    storeConnections.map((c) => connectionToEdge(c, allElements, chainSet))
  );

  // Re-sync nodes when store data or highlight changes
  useEffect(() => {
    setNodes(storeElements.map((el) => elementToNode(el, errorElementIds, highlightSet, chainSet)));
  }, [storeElements, errorElementIds, highlightSet, chainSet]);

  useEffect(() => {
    setEdges(storeConnections.map((c) => connectionToEdge(c, allElements, chainSet)));
  }, [storeConnections, allElements, chainSet]); // eslint-disable-line

  // RF instance
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // On init: check if we need to focus a specific element (cross-view navigation)
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      setRfInstance(instance);
      const fid = focusElementId;
      if (fid) {
        setTimeout(() => {
          instance.fitView({
            nodes: [{ id: fid }],
            padding: 0.6,
            duration: 500,
            maxZoom: 1.5,
          });
          clearFocus();
        }, 120);
      }
    },
    [focusElementId, clearFocus]
  );

  // ---- Handlers ----

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((prev) => applyNodeChanges(changes, prev)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((prev) => applyEdgeChanges(changes, prev)),
    []
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateElementPosition(node.id, node.position.x, node.position.y);
    },
    [updateElementPosition]
  );

  const onConnect = useCallback(
    (connection: RFConnection) => {
      if (!connection.source || !connection.target) return;
      const sourceEl = allElements.find((e) => e.id === connection.source);
      const targetEl = allElements.find((e) => e.id === connection.target);
      if (!sourceEl || !targetEl) return;

      const connKind = DEFAULT_CONNECTION_KIND[diagram.type];
      if (!ValidationEngine.isConnectionAllowed(sourceEl.kind, targetEl.kind, connKind)) {
        console.warn(`Connection blocked: ${sourceEl.kind} → ${targetEl.kind} via ${connKind}`);
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
      const newEdge: Edge<ArcadiaEdgeData> = {
        id: newConn.id,
        source: connection.source,
        target: connection.target,
        type: "arcadia",
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {
          connectionKind: connKind,
          exchangeItems: [],
          isChainHighlighted: false,
          isRealization: connKind === "RealizationLink",
        },
      };
      setEdges((prev) => addEdge(newEdge, prev));
    },
    [allElements, diagram, addConnectionToStore]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => selectElement(node.id),
    [selectElement]
  );

  const onPaneClick = useCallback(() => selectElement(null), [selectElement]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/arcadia-kind") as ElementKind;
      if (!kind) return;

      const position = rfInstance?.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        ?? { x: 150, y: 150 };

      addElementToStore({
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
      });
    },
    [rfInstance, diagram, addElementToStore]
  );

  return (
    <div ref={wrapperRef} className="h-full w-full" tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={handleInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        deleteKeyCode="Delete"
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable style={{ borderRadius: 8 }} />
        <CanvasToolbar />
      </ReactFlow>
    </div>
  );
}
