"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ElementKind } from "@/domain/entities";
import { useEditorStore } from "@/lib/store";

// ----------------------------------------------------------------
// Color palette per ElementKind
// ----------------------------------------------------------------

const KIND_STYLE: Record<
  ElementKind,
  { bg: string; border: string; text: string; badge: string }
> = {
  OperationalEntity:      { bg: "#fffbeb", border: "#f59e0b", text: "#78350f", badge: "#fde68a" },
  OperationalActivity:    { bg: "#fffbeb", border: "#f59e0b", text: "#78350f", badge: "#fde68a" },
  OperationalInteraction: { bg: "#fef9c3", border: "#eab308", text: "#713f12", badge: "#fef08a" },
  SystemFunction:         { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a", badge: "#bfdbfe" },
  SystemExchangeItem:     { bg: "#f0f9ff", border: "#0ea5e9", text: "#0c4a6e", badge: "#bae6fd" },
  SystemInterface:        { bg: "#e0f2fe", border: "#0284c7", text: "#0c4a6e", badge: "#7dd3fc" },
  FunctionalChain:        { bg: "#f0f9ff", border: "#38bdf8", text: "#0c4a6e", badge: "#bae6fd" },
  LogicalComponent:       { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", badge: "#bbf7d0" },
  LogicalFunction:        { bg: "#ecfdf5", border: "#10b981", text: "#064e3b", badge: "#a7f3d0" },
  LogicalInterface:       { bg: "#f0fdf4", border: "#4ade80", text: "#14532d", badge: "#bbf7d0" },
  LogicalExchangeItem:    { bg: "#f7fef4", border: "#86efac", text: "#14532d", badge: "#d9f99d" },
  PhysicalComponent:      { bg: "#faf5ff", border: "#a855f7", text: "#3b0764", badge: "#e9d5ff" },
  PhysicalFunction:       { bg: "#f5f3ff", border: "#8b5cf6", text: "#2e1065", badge: "#ddd6fe" },
  PhysicalInterface:      { bg: "#fdf4ff", border: "#c026d3", text: "#4a044e", badge: "#f0abfc" },
  PhysicalLink:           { bg: "#fdf4ff", border: "#a855f7", text: "#3b0764", badge: "#e9d5ff" },
  PhysicalExchangeItem:   { bg: "#fdf4ff", border: "#d946ef", text: "#4a044e", badge: "#f5d0fe" },
  PhysicalPort:           { bg: "#fdf4ff", border: "#e879f9", text: "#4a044e", badge: "#f5d0fe" },
  ConfigurationItem:      { bg: "#f8fafc", border: "#64748b", text: "#0f172a", badge: "#cbd5e1" },
  ExchangePort:           { bg: "#f8fafc", border: "#94a3b8", text: "#0f172a", badge: "#e2e8f0" },
  FunctionPort:           { bg: "#f8fafc", border: "#94a3b8", text: "#0f172a", badge: "#e2e8f0" },
  RealizationLink:        { bg: "#f8fafc", border: "#94a3b8", text: "#0f172a", badge: "#e2e8f0" },
};

const KIND_LABEL: Partial<Record<ElementKind, string>> = {
  OperationalEntity: "OE", OperationalActivity: "OA", OperationalInteraction: "OI",
  SystemFunction: "SF", SystemExchangeItem: "SEI", SystemInterface: "SI", FunctionalChain: "FC",
  LogicalComponent: "LC", LogicalFunction: "LF", LogicalInterface: "LI", LogicalExchangeItem: "LEI",
  PhysicalComponent: "PC", PhysicalFunction: "PF", PhysicalInterface: "PI",
  PhysicalLink: "PL", PhysicalExchangeItem: "PEI", PhysicalPort: "PP",
  ConfigurationItem: "CI", ExchangePort: "EP", FunctionPort: "FP", RealizationLink: "RL",
};

// ----------------------------------------------------------------
// Node data shape
// ----------------------------------------------------------------

export interface ArcadiaNodeData {
  elementId: string;
  kind: ElementKind;
  name: string;
  hasError?: boolean;
  isInTraceChain?: boolean;
  isInFunctionalChain?: boolean;
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

function ArcadiaNodeComponent({ data, selected }: NodeProps<ArcadiaNodeData>) {
  const style = KIND_STYLE[data.kind] ?? KIND_STYLE.ConfigurationItem;
  const shortLabel = KIND_LABEL[data.kind] ?? data.kind.slice(0, 3);

  const updateName = useEditorStore((s) => s.updateElementName);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync draft when name changes externally
  useEffect(() => {
    if (!editing) setDraft(data.name);
  }, [data.name, editing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const confirmEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== data.name) {
      updateName(data.elementId, trimmed);
    } else {
      setDraft(data.name);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // prevent React Flow from intercepting keys
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") {
      setDraft(data.name);
      setEditing(false);
    }
  };

  const borderColor = data.hasError
    ? "#ef4444"
    : selected
    ? "#1d4ed8"
    : data.isInTraceChain
    ? "#7c3aed"
    : data.isInFunctionalChain
    ? "#ea580c"
    : style.border;

  const boxShadow = data.hasError
    ? "0 0 0 3px #fecaca"
    : selected
    ? "0 0 0 3px #bfdbfe"
    : data.isInTraceChain
    ? "0 0 0 3px #ede9fe"
    : data.isInFunctionalChain
    ? "0 0 0 3px #fed7aa"
    : "0 1px 3px rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        background: style.bg,
        border: `2px solid ${borderColor}`,
        boxShadow,
        color: style.text,
        borderRadius: 8,
        minWidth: 140,
        padding: "8px 12px",
        fontFamily: "inherit",
        transition: "box-shadow 0.15s, border-color 0.15s",
        cursor: editing ? "text" : "default",
      }}
      onDoubleClick={() => !editing && setEditing(true)}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: style.border, width: 10, height: 10 }}
      />

      {/* Kind badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span
          style={{
            background: style.badge,
            color: style.text,
            borderRadius: 4,
            padding: "1px 5px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {shortLabel}
        </span>
        {data.hasError && (
          <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>
            ⚠
          </span>
        )}
        {data.isInTraceChain && !data.hasError && (
          <span style={{ color: "#7c3aed", fontSize: 11, marginLeft: "auto" }} title="در زنجیره ردیابی">
            ⬡
          </span>
        )}
        {data.isInFunctionalChain && !data.hasError && !data.isInTraceChain && (
          <span style={{ color: "#ea580c", fontSize: 11, marginLeft: "auto" }} title="عضو FunctionalChain">
            ⬡
          </span>
        )}
      </div>

      {/* Name — editable on double-click */}
      {editing ? (
        <input
          ref={inputRef}
          className="nodrag"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirmEdit}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: 13,
            fontWeight: 600,
            width: "100%",
            background: "white",
            border: `1px solid ${style.border}`,
            borderRadius: 4,
            padding: "2px 4px",
            outline: "none",
            color: style.text,
            lineHeight: 1.3,
          }}
        />
      ) : (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}
        >
          {data.name}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: style.border, width: 10, height: 10 }}
      />
    </div>
  );
}

export const ArcadiaNode = memo(ArcadiaNodeComponent);
