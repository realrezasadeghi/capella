"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ElementKind } from "@/domain/entities";
import { useEditorStore } from "@/lib/store";

// ──────────────────────────────────────────────────────────────────
// Color palette — one entry per Arcadia layer
// ──────────────────────────────────────────────────────────────────
const LC = {
  oa:    { fill:"#FFFBEB", stroke:"#F59E0B", text:"#78350F", badge:"#FDE68A", icon:"#D97706" },
  sa:    { fill:"#EFF6FF", stroke:"#2563EB", text:"#1E3A8A", badge:"#BFDBFE", icon:"#2563EB" },
  la:    { fill:"#ECFDF5", stroke:"#059669", text:"#064E3B", badge:"#A7F3D0", icon:"#059669" },
  pa:    { fill:"#F5F3FF", stroke:"#7C3AED", text:"#2E1065", badge:"#DDD6FE", icon:"#7C3AED" },
  epbs:  { fill:"#F8FAFC", stroke:"#475569", text:"#0F172A", badge:"#CBD5E1", icon:"#475569" },
  sh:    { fill:"#F1F5F9", stroke:"#94A3B8", text:"#334155", badge:"#E2E8F0", icon:"#64748B" },
} as const;
type Color = typeof LC.oa;

const KIND_COLOR: Record<ElementKind, Color> = {
  OperationalEntity:      LC.oa,
  OperationalActivity:    LC.oa,
  OperationalInteraction: LC.oa,
  SystemFunction:         LC.sa,
  SystemExchangeItem:     LC.sa,
  SystemInterface:        LC.sa,
  FunctionalChain:        LC.sa,
  LogicalComponent:       LC.la,
  LogicalFunction:        LC.la,
  LogicalInterface:       LC.la,
  LogicalExchangeItem:    LC.la,
  PhysicalComponent:      LC.pa,
  PhysicalFunction:       LC.pa,
  PhysicalInterface:      LC.pa,
  PhysicalLink:           LC.pa,
  PhysicalExchangeItem:   LC.pa,
  PhysicalPort:           LC.pa,
  ConfigurationItem:      LC.epbs,
  ExchangePort:           LC.sh,
  FunctionPort:           LC.sh,
  RealizationLink:        LC.sh,
};

// ── Shape variant per ElementKind ────────────────────────────────
type SV =
  | "entity"     // OperationalEntity   — rounded rect + actor icon header
  | "activity"   // functions / OA      — compact rounded rect + ƒ() header
  | "hex"        // OperationalInteraction — hexagon clip
  | "component"  // LC, PC              — component box with UML ear-tabs
  | "iface"      // interfaces          — left-bar lollipop block
  | "xitem"      // exchange items      — small pill / tag
  | "chain"      // FunctionalChain     — dashed container
  | "document"   // ConfigurationItem   — folded-corner document
  | "port"       // ports               — tiny filled square
  | "link";      // RL, PL              — dashed arrow label

const KIND_SHAPE: Record<ElementKind, SV> = {
  OperationalEntity:      "entity",
  OperationalActivity:    "activity",
  OperationalInteraction: "hex",
  SystemFunction:         "activity",
  SystemExchangeItem:     "xitem",
  SystemInterface:        "iface",
  FunctionalChain:        "chain",
  LogicalComponent:       "component",
  LogicalFunction:        "activity",
  LogicalInterface:       "iface",
  LogicalExchangeItem:    "xitem",
  PhysicalComponent:      "component",
  PhysicalFunction:       "activity",
  PhysicalInterface:      "iface",
  PhysicalLink:           "link",
  PhysicalExchangeItem:   "xitem",
  PhysicalPort:           "port",
  ConfigurationItem:      "document",
  ExchangePort:           "port",
  FunctionPort:           "port",
  RealizationLink:        "link",
};

const KIND_BADGE: Partial<Record<ElementKind, string>> = {
  OperationalEntity:"OE",    OperationalActivity:"OA",    OperationalInteraction:"OI",
  SystemFunction:"SF",       SystemExchangeItem:"SEI",    SystemInterface:"SI",     FunctionalChain:"FC",
  LogicalComponent:"LC",     LogicalFunction:"LF",        LogicalInterface:"LI",    LogicalExchangeItem:"LEI",
  PhysicalComponent:"PC",    PhysicalFunction:"PF",       PhysicalInterface:"PI",
  PhysicalLink:"PL",         PhysicalExchangeItem:"PEI",  PhysicalPort:"PP",
  ConfigurationItem:"CI",    ExchangePort:"EP",           FunctionPort:"FP",        RealizationLink:"RL",
};

// ── Micro SVG icons ──────────────────────────────────────────────
const ActorSVG = ({ c }: { c: string }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <circle cx="6.5" cy="3.2" r="2" fill={c} opacity="0.85"/>
    <path d="M1.5 12.5c0-2.8 2.24-5 5-5s5 2.2 5 5" stroke={c} strokeWidth="1.4"
      strokeLinecap="round" fill="none" opacity="0.85"/>
  </svg>
);

const CompSVG = ({ c }: { c: string }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <rect x="3" y="1" width="9" height="11" rx="1" stroke={c} strokeWidth="1.2" fill="none" opacity="0.8"/>
    <rect x="0.5" y="3"   width="4" height="2.5" rx="0.5" stroke={c} strokeWidth="1"
      fill={c} fillOpacity="0.2" opacity="0.8"/>
    <rect x="0.5" y="7.5" width="4" height="2.5" rx="0.5" stroke={c} strokeWidth="1"
      fill={c} fillOpacity="0.2" opacity="0.8"/>
  </svg>
);

const FnSVG = ({ c }: { c: string }) => (
  <svg width="16" height="13" viewBox="0 0 20 14" fill="none" aria-hidden="true">
    <text x="0" y="12" fontSize="13" fontWeight="800" fill={c} opacity="0.7" fontFamily="monospace">ƒ()</text>
  </svg>
);

const ChainSVG = ({ c }: { c: string }) => (
  <svg width="15" height="14" viewBox="0 0 18 16" fill="none" aria-hidden="true">
    <ellipse cx="5"  cy="8" rx="4" ry="2.5" stroke={c} strokeWidth="1.3" fill="none" opacity="0.8"/>
    <ellipse cx="13" cy="8" rx="4" ry="2.5" stroke={c} strokeWidth="1.3" fill="none" opacity="0.8"/>
    <line x1="7" y1="8" x2="11" y2="8" stroke={c} strokeWidth="1.3" opacity="0.6"/>
  </svg>
);

const DocSVG = ({ c }: { c: string }) => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
    <path d="M1 1h8l2 2v10H1V1z" stroke={c} strokeWidth="1.2" fill="none" opacity="0.8"/>
    <path d="M9 1v2h2" stroke={c} strokeWidth="1.2" fill="none" opacity="0.8"/>
    <line x1="3" y1="7"   x2="9" y2="7"   stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <line x1="3" y1="9.5" x2="9" y2="9.5" stroke={c} strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// ── Node data shape ───────────────────────────────────────────────
export interface ArcadiaNodeData {
  elementId: string;
  kind: ElementKind;
  name: string;
  hasError?: boolean;
  isInTraceChain?: boolean;
  isInFunctionalChain?: boolean;
}

// ── Shared inline name editor ─────────────────────────────────────
interface NameProps {
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  confirm: () => void;
  onKD: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  name: string;
  color: Color;
  fullWidth?: boolean;
}
function NameField({ editing, draft, setDraft, confirm, onKD, inputRef, name, color, fullWidth }: NameProps) {
  if (editing) {
    return (
      <input
        ref={inputRef}
        className="nodrag"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={confirm}
        onKeyDown={onKD}
        style={{
          fontSize: 13, fontWeight: 600, color: color.text,
          background: "white", border: `1px solid ${color.stroke}`,
          borderRadius: 4, padding: "2px 5px", outline: "none",
          width: fullWidth ? "100%" : 90,
          lineHeight: 1.3,
        }}
      />
    );
  }
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: color.text, lineHeight: 1.35, wordBreak: "break-word" }}>
      {name}
    </div>
  );
}

// ── State indicator icon ─────────────────────────────────────────
function StateIcon({ hasError, isInTraceChain, isInFunctionalChain }: Pick<ArcadiaNodeData, "hasError"|"isInTraceChain"|"isInFunctionalChain">) {
  if (hasError)          return <span style={{ color:"#EF4444", fontSize:10, marginLeft:"auto" }}>⚠</span>;
  if (isInTraceChain)    return <span style={{ color:"#7C3AED", fontSize:10, marginLeft:"auto" }}>⬡</span>;
  if (isInFunctionalChain) return <span style={{ color:"#EA580C", fontSize:10, marginLeft:"auto" }}>⬡</span>;
  return null;
}

// ── Handle style ─────────────────────────────────────────────────
const mkHs = (border: string, size = 10) => ({
  width: size, height: size,
  background: border,
  border: "2px solid white",
  borderRadius: 3,
});

// ── Main node component ───────────────────────────────────────────
function ArcadiaNodeComponent({ data, selected }: NodeProps<ArcadiaNodeData>) {
  const { kind, name, elementId, hasError, isInTraceChain, isInFunctionalChain } = data;
  const c  = KIND_COLOR[kind] ?? LC.sh;
  const sv = KIND_SHAPE[kind] ?? "activity";
  const badge = KIND_BADGE[kind] ?? kind.slice(0, 3);

  // ── Border / shadow based on state ─────────────────────────────
  const borderColor = hasError
    ? "#EF4444"
    : selected
    ? "#1D4ED8"
    : isInTraceChain
    ? "#7C3AED"
    : isInFunctionalChain
    ? "#EA580C"
    : c.stroke;

  const boxShadow = hasError
    ? "0 0 0 3px #FCA5A5"
    : selected
    ? "0 0 0 3px #BFDBFE"
    : isInTraceChain
    ? "0 0 0 3px #EDE9FE"
    : isInFunctionalChain
    ? "0 0 0 3px #FED7AA"
    : "0 2px 8px rgba(0,0,0,0.10)";

  const hs = mkHs(borderColor);

  // ── Inline editing ─────────────────────────────────────────────
  const updateName = useEditorStore((s) => s.updateElementName);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft  ] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(name); }, [name, editing]);
  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  const confirm = () => {
    const t = draft.trim();
    if (t && t !== name) updateName(elementId, t);
    else setDraft(name);
    setEditing(false);
  };
  const onKD = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter")  confirm();
    if (e.key === "Escape") { setDraft(name); setEditing(false); }
  };

  const nameProps: NameProps = { editing, draft, setDraft, confirm, onKD, inputRef, name, color: c, fullWidth: true };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PORT — tiny filled square (24×24)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "port") {
    return (
      <div
        title={name}
        onDoubleClick={() => setEditing(true)}
        style={{
          width: 30, height: 30,
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 700, color: c.text,
          cursor: "default",
        }}
      >
        <Handle type="target" position={Position.Left}  style={mkHs(borderColor, 8)} />
        <Handle type="source" position={Position.Right} style={mkHs(borderColor, 8)} />
        {badge}
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXCHANGE ITEM — horizontal pill / tag
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "xitem") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: c.fill,
          border: `1.5px solid ${borderColor}`,
          boxShadow,
          borderRadius: 999,
          padding: "4px 10px",
          display: "flex", alignItems: "center", gap: 6,
          whiteSpace: editing ? undefined : "nowrap",
          cursor: "default",
        }}
      >
        <Handle type="target" position={Position.Left}  style={mkHs(borderColor, 8)} />
        <span style={{
          background: c.badge, color: c.text,
          borderRadius: 999, padding: "1px 6px",
          fontSize: 9, fontWeight: 700, whiteSpace: "nowrap",
        }}>{badge}</span>
        {editing ? (
          <input
            ref={inputRef} className="nodrag"
            value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={confirm} onKeyDown={onKD}
            style={{
              fontSize: 11, fontWeight: 600, color: c.text,
              background: "transparent", border: "none", outline: "none", width: 90,
            }}
          />
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{name}</span>
        )}
        <Handle type="source" position={Position.Right} style={mkHs(borderColor, 8)} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEXAGON — OperationalInteraction
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "hex") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          clipPath: "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
          minWidth: 120,
          padding: "10px 30px",
          textAlign: "center",
          cursor: "default",
        }}
      >
        <Handle type="target" position={Position.Left}  style={{ ...hs, left: 10 }} />
        <div style={{ fontSize: 9, fontWeight: 700, color: c.icon, marginBottom: 3 }}>{badge}</div>
        {editing ? (
          <input
            ref={inputRef} className="nodrag"
            value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={confirm} onKeyDown={onKD}
            style={{
              fontSize: 11, fontWeight: 600, color: c.text,
              background: "transparent", border: `1px solid ${c.stroke}`,
              borderRadius: 3, outline: "none", width: "100%", textAlign: "center",
            }}
          />
        ) : (
          <div style={{ fontSize: 11, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{name}</div>
        )}
        <Handle type="source" position={Position.Right} style={{ ...hs, right: 10 }} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LINK — RealizationLink, PhysicalLink
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "link") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: c.fill,
          border: `1.5px dashed ${borderColor}`,
          boxShadow,
          borderRadius: 6,
          padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 6,
          cursor: "default",
        }}
      >
        <Handle type="target" position={Position.Left}  style={mkHs(borderColor, 8)} />
        <span style={{ color: c.icon, fontSize: 12, lineHeight: 1 }}>↔</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: c.icon }}>{badge}</span>
        {editing ? (
          <input
            ref={inputRef} className="nodrag"
            value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={confirm} onKeyDown={onKD}
            style={{
              fontSize: 11, color: c.text,
              background: "transparent", border: "none", outline: "none", width: 90,
            }}
          />
        ) : (
          <span style={{ fontSize: 11, fontWeight: 500, color: c.text }}>{name}</span>
        )}
        <Handle type="source" position={Position.Right} style={mkHs(borderColor, 8)} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTERFACE — SI, LI, PI — left bar + lollipop look
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "iface") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          borderRadius: 6,
          minWidth: 120,
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        <Handle type="target" position={Position.Left}  style={hs} />
        {/* Left accent bar */}
        <div style={{ width: 5, background: c.stroke, flexShrink: 0 }} />
        <div style={{ padding: "7px 10px", flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: c.icon, letterSpacing: "0.05em", marginBottom: 3 }}>
            {badge}
          </div>
          <NameField {...nameProps} />
        </div>
        <Handle type="source" position={Position.Right} style={hs} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPONENT — LC, PC — UML component notation with ear-tabs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "component") {
    const earStyle: React.CSSProperties = {
      position: "absolute",
      left: -13,
      width: 13, height: 16,
      background: c.fill,
      border: `2px solid ${borderColor}`,
      borderRight: "none",
      borderRadius: "3px 0 0 3px",
      zIndex: 1,
    };
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{ position: "relative", overflow: "visible", cursor: "default" }}
      >
        {/* UML ear-tabs */}
        <div style={{ ...earStyle, top: "22%" }} />
        <div style={{ ...earStyle, top: "56%" }} />

        <div style={{
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          borderRadius: 8,
          minWidth: 155,
          overflow: "hidden",
        }}>
          {/* Header band */}
          <div style={{
            background: c.badge,
            padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <CompSVG c={c.icon} />
            <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: "0.05em" }}>{badge}</span>
            <StateIcon hasError={hasError} isInTraceChain={isInTraceChain} isInFunctionalChain={isInFunctionalChain} />
          </div>
          {/* Name body */}
          <div style={{ padding: "7px 10px" }}>
            <NameField {...nameProps} />
          </div>
        </div>

        <Handle type="target" position={Position.Left}  style={{ ...hs, zIndex: 2 }} />
        <Handle type="source" position={Position.Right} style={hs} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ENTITY — OperationalEntity — actor icon + rounded header
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "entity") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          borderRadius: 10,
          minWidth: 155,
          overflow: "hidden",
          cursor: "default",
        }}
      >
        <div style={{
          background: c.badge,
          padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <ActorSVG c={c.icon} />
          <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: "0.05em" }}>{badge}</span>
          <StateIcon hasError={hasError} isInTraceChain={isInTraceChain} isInFunctionalChain={isInFunctionalChain} />
        </div>
        <div style={{ padding: "7px 10px" }}>
          <NameField {...nameProps} />
        </div>

        <Handle type="target" position={Position.Left}  style={hs} />
        <Handle type="source" position={Position.Right} style={hs} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FUNCTIONAL CHAIN — dashed container with chain-link icon
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "chain") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{
          background: `${c.fill}CC`,
          border: `2px dashed ${borderColor}`,
          boxShadow,
          borderRadius: 10,
          minWidth: 165,
          overflow: "hidden",
          cursor: "default",
        }}
      >
        <div style={{
          padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 6,
          borderBottom: `1px dashed ${c.stroke}40`,
        }}>
          <ChainSVG c={c.icon} />
          <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: "0.05em" }}>{badge}</span>
          <StateIcon hasError={hasError} isInTraceChain={isInTraceChain} isInFunctionalChain={isInFunctionalChain} />
        </div>
        <div style={{ padding: "7px 10px" }}>
          <NameField {...nameProps} />
        </div>

        <Handle type="target" position={Position.Left}  style={hs} />
        <Handle type="source" position={Position.Right} style={hs} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOCUMENT — ConfigurationItem — folded-corner file shape
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (sv === "document") {
    return (
      <div
        onDoubleClick={() => setEditing(true)}
        style={{ position: "relative", cursor: "default" }}
      >
        <div style={{
          background: c.fill,
          border: `2px solid ${borderColor}`,
          boxShadow,
          borderRadius: 6,
          minWidth: 155,
          clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6,
            borderBottom: `1px solid ${c.badge}`,
          }}>
            <DocSVG c={c.icon} />
            <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: "0.05em" }}>{badge}</span>
            <StateIcon hasError={hasError} isInTraceChain={isInTraceChain} isInFunctionalChain={isInFunctionalChain} />
          </div>
          <div style={{ padding: "7px 10px" }}>
            <NameField {...nameProps} />
          </div>
        </div>
        {/* Fold corner accent */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 18, height: 18,
          background: `linear-gradient(225deg, white 50%, ${c.stroke} 50%)`,
          borderLeft: `1px solid ${c.stroke}`,
          borderBottom: `1px solid ${c.stroke}`,
        }} />

        <Handle type="target" position={Position.Left}  style={hs} />
        <Handle type="source" position={Position.Right} style={hs} />
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ACTIVITY (default) — functions, OA, etc.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{
        background: c.fill,
        border: `2px solid ${borderColor}`,
        boxShadow,
        borderRadius: 8,
        minWidth: 140,
        overflow: "hidden",
        cursor: "default",
      }}
    >
      <div style={{
        padding: "4px 10px",
        display: "flex", alignItems: "center", gap: 6,
        background: `${c.badge}90`,
        borderBottom: `1px solid ${c.badge}`,
      }}>
        <FnSVG c={c.icon} />
        <span style={{ fontSize: 9, fontWeight: 700, color: c.text, letterSpacing: "0.05em" }}>{badge}</span>
        <StateIcon hasError={hasError} isInTraceChain={isInTraceChain} isInFunctionalChain={isInFunctionalChain} />
      </div>
      <div style={{ padding: "6px 10px" }}>
        <NameField {...nameProps} />
      </div>

      <Handle type="target" position={Position.Left}  style={hs} />
      <Handle type="source" position={Position.Right} style={hs} />
    </div>
  );
}

export const ArcadiaNode = memo(ArcadiaNodeComponent);
