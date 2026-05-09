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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  ShieldCheck,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

import { useEditorStore, DEFAULT_CONNECTION_KIND } from "@/lib/store";
import type {
  Diagram,
  Element as ArcadiaElement,
  Connection as ArcadiaConnection,
  ElementKind,
  ValidationResult,
} from "@/domain/entities";
import { ValidationEngine } from "@/domain/services/ValidationEngine";
import { ArcadiaNode, type ArcadiaNodeData } from "./ArcadiaNode";

// ----------------------------------------------------------------
// Node types — stable reference (outside component)
// ----------------------------------------------------------------

const NODE_TYPES = { arcadia: ArcadiaNode };

// ----------------------------------------------------------------
// Converters
// ----------------------------------------------------------------

function elementToNode(
  el: ArcadiaElement,
  errorIds: Set<string>
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
    },
    style: { width: el.size?.width ?? 160 },
  };
}

function connectionToEdge(conn: ArcadiaConnection): Edge {
  return {
    id: conn.id,
    source: conn.sourceId,
    target: conn.targetId,
    label: conn.label || undefined,
    animated: conn.kind === "RealizationLink",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
  };
}

// ----------------------------------------------------------------
// Canvas Toolbar — must live INSIDE <ReactFlow> to use useReactFlow
// ----------------------------------------------------------------

function CanvasToolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();

  const deleteElement = useEditorStore((s) => s.deleteElement);
  const deleteConnection = useEditorStore((s) => s.deleteConnection);
  const runValidation = useEditorStore((s) => s.runValidation);
  const validationResults = useEditorStore((s) => s.validationResults);
  const validationVisible = useEditorStore((s) => s.validationVisible);
  const toggleValidationPanel = useEditorStore((s) => s.toggleValidationPanel);

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  const errorCount = validationResults.filter(
    (r) => r.severity === "error"
  ).length;
  const warnCount = validationResults.filter(
    (r) => r.severity === "warning"
  ).length;

  const handleDelete = () => {
    selectedNodes.forEach((n) => deleteElement(n.id));
    selectedEdges.forEach((e) => deleteConnection(e.id));
  };

  const btn =
    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors";

  return (
    <Panel position="top-center">
      <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 shadow-md">
        {/* Zoom controls */}
        <button
          title="Fit View"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}
        >
          <Maximize2 size={14} />
          <span>Fit</span>
        </button>
        <button
          title="Zoom In"
          onClick={() => zoomIn({ duration: 200 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}
        >
          <ZoomIn size={14} />
        </button>
        <button
          title="Zoom Out"
          onClick={() => zoomOut({ duration: 200 })}
          className={`${btn} text-neutral-600 hover:bg-neutral-100`}
        >
          <ZoomOut size={14} />
        </button>

        <div className="mx-1 h-4 w-px bg-neutral-200" />

        {/* Delete */}
        <button
          title="Delete selected (Del)"
          onClick={handleDelete}
          disabled={!hasSelection}
          className={`${btn} ${
            hasSelection
              ? "text-red-600 hover:bg-red-50"
              : "cursor-not-allowed text-neutral-300"
          }`}
        >
          <Trash2 size={14} />
          <span>Delete</span>
          {hasSelection && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
              {selectedNodes.length + selectedEdges.length}
            </span>
          )}
        </button>

        <div className="mx-1 h-4 w-px bg-neutral-200" />

        {/* Validate */}
        <button
          title="Validate model"
          onClick={runValidation}
          className={`${btn} text-blue-600 hover:bg-blue-50`}
        >
          <ShieldCheck size={14} />
          <span>Validate</span>
        </button>
        {validationResults.length > 0 && (
          <button
            onClick={toggleValidationPanel}
            className={`${btn} ${
              errorCount > 0
                ? "text-red-600 hover:bg-red-50"
                : "text-amber-600 hover:bg-amber-50"
            }`}
          >
            {errorCount > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                {errorCount} ×
              </span>
            )}
            {warnCount > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                {warnCount} ⚠
              </span>
            )}
          </button>
        )}
      </div>
    </Panel>
  );
}

// ----------------------------------------------------------------
// Validation Panel — inside <ReactFlow>
// ----------------------------------------------------------------

function ValidationPanel({ diagramId }: { diagramId: string }) {
  const validationResults = useEditorStore((s) => s.validationResults);
  const validationVisible = useEditorStore((s) => s.validationVisible);
  const toggleValidationPanel = useEditorStore((s) => s.toggleValidationPanel);
  const selectElement = useEditorStore((s) => s.selectElement);

  if (!validationVisible || validationResults.length === 0) return null;

  const sevIcon = (r: ValidationResult) => {
    if (r.severity === "error")
      return <AlertCircle size={13} className="shrink-0 text-red-500" />;
    if (r.severity === "warning")
      return <AlertTriangle size={13} className="shrink-0 text-amber-500" />;
    return <Info size={13} className="shrink-0 text-blue-500" />;
  };

  return (
    <Panel position="bottom-left">
      <div className="w-80 rounded-xl border border-neutral-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
          <span className="text-xs font-semibold text-neutral-700">
            نتایج اعتبارسنجی ({validationResults.length})
          </span>
          <button
            onClick={toggleValidationPanel}
            className="rounded p-0.5 text-neutral-400 hover:text-neutral-700"
          >
            <X size={13} />
          </button>
        </div>

        {/* Results list */}
        <ul className="max-h-52 overflow-y-auto divide-y divide-neutral-50">
          {validationResults.map((r, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 px-3 py-2 text-[11px] ${
                r.elementId
                  ? "cursor-pointer hover:bg-neutral-50"
                  : ""
              }`}
              onClick={() => r.elementId && selectElement(r.elementId)}
            >
              {sevIcon(r)}
              <span className="text-neutral-600 leading-tight">{r.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

// ----------------------------------------------------------------
// Public DiagramEditor — handles null case
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
// DiagramCanvas — the actual React Flow canvas
// ----------------------------------------------------------------

function DiagramCanvas({ diagram }: { diagram: Diagram }) {
  // Store
  const storeElements = useEditorStore((s) =>
    s.elements.filter((e) => e.diagramId === diagram.id)
  );
  const storeConnections = useEditorStore((s) =>
    s.connections.filter((c) => c.diagramId === diagram.id)
  );
  const allElements = useEditorStore((s) => s.elements);
  const validationResults = useEditorStore((s) => s.validationResults);

  const updateElementPosition = useEditorStore((s) => s.updateElementPosition);
  const addElementToStore = useEditorStore((s) => s.addElement);
  const addConnectionToStore = useEditorStore((s) => s.addConnection);
  const selectElement = useEditorStore((s) => s.selectElement);

  // Error element IDs for badge display
  const errorElementIds = useMemo(
    () => new Set(validationResults.map((r) => r.elementId).filter(Boolean) as string[]),
    [validationResults]
  );

  // Local React Flow state
  const [nodes, setNodes] = useState<Node[]>(() =>
    storeElements.map((el) => elementToNode(el, errorElementIds))
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    storeConnections.map(connectionToEdge)
  );

  // Sync when store elements change (new drop or name update)
  const prevElCount = useRef(storeElements.length);
  useEffect(() => {
    if (storeElements.length !== prevElCount.current) {
      prevElCount.current = storeElements.length;
    }
    // Always re-derive to pick up name/error changes
    setNodes(storeElements.map((el) => elementToNode(el, errorElementIds)));
  }, [storeElements, errorElementIds]);

  useEffect(() => {
    setEdges(storeConnections.map(connectionToEdge));
  }, [storeConnections.length]); // eslint-disable-line

  // RF instance for coordinate conversion
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ---- Handlers ----

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((prev) => applyNodeChanges(changes, prev));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((prev) => applyEdgeChanges(changes, prev));
  }, []);

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
      const allowed = ValidationEngine.isConnectionAllowed(
        sourceEl.kind,
        targetEl.kind,
        connKind
      );
      if (!allowed) {
        // Non-blocking toast alternative: just warn in console and skip
        console.warn(
          `Connection blocked: ${sourceEl.kind} → ${targetEl.kind} via ${connKind}`
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

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectElement(node.id);
    },
    [selectElement]
  );

  const onPaneClick = useCallback(() => {
    selectElement(null);
  }, [selectElement]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/arcadia-kind") as ElementKind;
      if (!kind) return;

      const position = rfInstance?.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      }) ?? { x: 150, y: 150 };

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
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={NODE_TYPES}
        deleteKeyCode="Delete"
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable style={{ borderRadius: 8 }} />
        <CanvasToolbar />
        <ValidationPanel diagramId={diagram.id} />
      </ReactFlow>
    </div>
  );
}
