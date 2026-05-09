"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import type { ElementKind } from "@/domain/entities";

// ----------------------------------------------------------------
// Color palette per ElementKind
// ----------------------------------------------------------------

const KIND_STYLE: Record<
  ElementKind,
  { bg: string; border: string; text: string; badge: string }
> = {
  // OA — amber
  OperationalEntity: {
    bg: "#fffbeb",
    border: "#f59e0b",
    text: "#78350f",
    badge: "#fde68a",
  },
  OperationalActivity: {
    bg: "#fffbeb",
    border: "#f59e0b",
    text: "#78350f",
    badge: "#fde68a",
  },
  OperationalInteraction: {
    bg: "#fef9c3",
    border: "#eab308",
    text: "#713f12",
    badge: "#fef08a",
  },
  // SA — blue
  SystemFunction: {
    bg: "#eff6ff",
    border: "#3b82f6",
    text: "#1e3a8a",
    badge: "#bfdbfe",
  },
  SystemExchangeItem: {
    bg: "#f0f9ff",
    border: "#0ea5e9",
    text: "#0c4a6e",
    badge: "#bae6fd",
  },
  SystemInterface: {
    bg: "#e0f2fe",
    border: "#0284c7",
    text: "#0c4a6e",
    badge: "#7dd3fc",
  },
  FunctionalChain: {
    bg: "#f0f9ff",
    border: "#38bdf8",
    text: "#0c4a6e",
    badge: "#bae6fd",
  },
  // LA — green
  LogicalComponent: {
    bg: "#f0fdf4",
    border: "#22c55e",
    text: "#14532d",
    badge: "#bbf7d0",
  },
  LogicalFunction: {
    bg: "#ecfdf5",
    border: "#10b981",
    text: "#064e3b",
    badge: "#a7f3d0",
  },
  LogicalInterface: {
    bg: "#f0fdf4",
    border: "#4ade80",
    text: "#14532d",
    badge: "#bbf7d0",
  },
  LogicalExchangeItem: {
    bg: "#f7fef4",
    border: "#86efac",
    text: "#14532d",
    badge: "#d9f99d",
  },
  // PA — purple
  PhysicalComponent: {
    bg: "#faf5ff",
    border: "#a855f7",
    text: "#3b0764",
    badge: "#e9d5ff",
  },
  PhysicalFunction: {
    bg: "#f5f3ff",
    border: "#8b5cf6",
    text: "#2e1065",
    badge: "#ddd6fe",
  },
  PhysicalInterface: {
    bg: "#fdf4ff",
    border: "#c026d3",
    text: "#4a044e",
    badge: "#f0abfc",
  },
  PhysicalLink: {
    bg: "#fdf4ff",
    border: "#a855f7",
    text: "#3b0764",
    badge: "#e9d5ff",
  },
  PhysicalExchangeItem: {
    bg: "#fdf4ff",
    border: "#d946ef",
    text: "#4a044e",
    badge: "#f5d0fe",
  },
  PhysicalPort: {
    bg: "#fdf4ff",
    border: "#e879f9",
    text: "#4a044e",
    badge: "#f5d0fe",
  },
  // EPBS — slate
  ConfigurationItem: {
    bg: "#f8fafc",
    border: "#64748b",
    text: "#0f172a",
    badge: "#cbd5e1",
  },
  // Shared
  ExchangePort: {
    bg: "#f8fafc",
    border: "#94a3b8",
    text: "#0f172a",
    badge: "#e2e8f0",
  },
  FunctionPort: {
    bg: "#f8fafc",
    border: "#94a3b8",
    text: "#0f172a",
    badge: "#e2e8f0",
  },
  RealizationLink: {
    bg: "#f8fafc",
    border: "#94a3b8",
    text: "#0f172a",
    badge: "#e2e8f0",
  },
};

// Short label map
const KIND_LABEL: Partial<Record<ElementKind, string>> = {
  OperationalEntity: "OE",
  OperationalActivity: "OA",
  OperationalInteraction: "OI",
  SystemFunction: "SF",
  SystemExchangeItem: "SEI",
  SystemInterface: "SI",
  FunctionalChain: "FC",
  LogicalComponent: "LC",
  LogicalFunction: "LF",
  LogicalInterface: "LI",
  LogicalExchangeItem: "LEI",
  PhysicalComponent: "PC",
  PhysicalFunction: "PF",
  PhysicalInterface: "PI",
  PhysicalLink: "PL",
  PhysicalExchangeItem: "PEI",
  PhysicalPort: "PP",
  ConfigurationItem: "CI",
  ExchangePort: "EP",
  FunctionPort: "FP",
  RealizationLink: "RL",
};

export interface ArcadiaNodeData {
  kind: ElementKind;
  name: string;
  selected?: boolean;
}

function ArcadiaNodeComponent({ data, selected }: NodeProps<ArcadiaNodeData>) {
  const style = KIND_STYLE[data.kind] ?? KIND_STYLE.ConfigurationItem;
  const shortLabel = KIND_LABEL[data.kind] ?? data.kind.slice(0, 3);

  return (
    <div
      style={{
        background: style.bg,
        border: `2px solid ${selected ? "#1d4ed8" : style.border}`,
        boxShadow: selected
          ? "0 0 0 3px #bfdbfe"
          : "0 1px 3px rgba(0,0,0,0.08)",
        color: style.text,
        borderRadius: 8,
        minWidth: 140,
        padding: "8px 12px",
        fontFamily: "inherit",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: style.border, width: 10, height: 10 }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
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
      </div>

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

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: style.border, width: 10, height: 10 }}
      />
    </div>
  );
}

export const ArcadiaNode = memo(ArcadiaNodeComponent);
