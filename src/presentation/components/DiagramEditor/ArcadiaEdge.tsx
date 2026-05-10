"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "reactflow";

// ----------------------------------------------------------------
// Edge data shape
// ----------------------------------------------------------------

export interface ArcadiaEdgeData {
  connectionKind: string;
  label?: string;
  exchangeItems: string[];   // resolved names (not IDs)
  isChainHighlighted: boolean;
  isRealization: boolean;
}

// Short abbreviations for connection kind badge
const KIND_ABBR: Record<string, string> = {
  SystemInterface:        "SI",
  LogicalInterface:       "LI",
  PhysicalLink:           "PL",
  PhysicalInterface:      "PI",
  OperationalInteraction: "OI",
  RealizationLink:        "RL",
  FunctionalChain:        "FC",
};

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

function ArcadiaEdgeComponent({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<ArcadiaEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isChain    = data?.isChainHighlighted;
  const isReal     = data?.isRealization;
  const isSelected = selected;

  // Color
  const stroke =
    isChain    ? "#ea580c" :
    isSelected ? "#1d4ed8" :
    isReal     ? "#7c3aed" :
    "#94a3b8";

  const strokeWidth = isChain || isSelected ? 2.5 : 2;
  const dash        = isReal ? "6 3" : undefined;

  const hasItems = (data?.exchangeItems?.length ?? 0) > 0;
  const abbr     = data?.connectionKind ? (KIND_ABBR[data.connectionKind] ?? null) : null;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth, strokeDasharray: dash }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex flex-col items-center gap-0.5"
        >
          {/* Exchange item badges */}
          {hasItems &&
            data!.exchangeItems.map((item, i) => (
              <span
                key={i}
                style={{ borderColor: stroke }}
                className="rounded-full border bg-white px-1.5 py-px text-[9px] font-medium text-neutral-500 shadow-sm"
              >
                {item}
              </span>
            ))}

          {/* Connection kind abbreviation — only when no items */}
          {!hasItems && abbr && (
            <span
              style={{ color: stroke, borderColor: stroke }}
              className="rounded border bg-white px-1 py-px text-[8px] font-bold opacity-70"
            >
              {abbr}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const ArcadiaEdge = memo(ArcadiaEdgeComponent);
