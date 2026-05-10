"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { X, ArrowRight, LayoutGrid, Table2, ExternalLink } from "lucide-react";
import type { Element as ArcadiaElement, ArcadiaView } from "@/domain/entities";
import { useEditorStore, VIEW_ORDER } from "@/lib/store";

// ── View metadata ─────────────────────────────────────────────────
const VM: Record<ArcadiaView, { label: string; color: string; bg: string; border: string; headerBg: string }> = {
  OA:   { label:"Operational",  color:"#92400e", bg:"#fffbeb", border:"#f59e0b", headerBg:"#fef3c7" },
  SA:   { label:"System",       color:"#1e3a8a", bg:"#eff6ff", border:"#3b82f6", headerBg:"#dbeafe" },
  LA:   { label:"Logical",      color:"#064e3b", bg:"#ecfdf5", border:"#10b981", headerBg:"#d1fae5" },
  PA:   { label:"Physical",     color:"#2e1065", bg:"#f5f3ff", border:"#8b5cf6", headerBg:"#ede9fe" },
  EPBS: { label:"EPBS",         color:"#0f172a", bg:"#f8fafc", border:"#64748b", headerBg:"#e2e8f0" },
};

interface OverviewPanelProps {
  onClose: () => void;
}

type Tab = "swimlane" | "matrix";

export default function OverviewPanel({ onClose }: OverviewPanelProps) {
  const [tab, setTab] = useState<Tab>("swimlane");

  const allElements  = useEditorStore((s) => s.elements);
  const diagrams     = useEditorStore((s) => s.diagrams);
  const navigateTo   = useEditorStore((s) => s.navigateTo);

  // Group elements by view
  const byView = useMemo(() => {
    const map = new Map<ArcadiaView, ArcadiaElement[]>();
    VIEW_ORDER.forEach((v) => map.set(v, []));
    for (const el of allElements) {
      const diag = diagrams.find((d) => d.id === el.diagramId);
      if (diag) map.get(diag.view)?.push(el);
    }
    return map;
  }, [allElements, diagrams]);

  const totalElements  = allElements.length;
  const linkedElements = allElements.filter((e) => e.realizationIds.length > 0).length;
  const totalLinks     = allElements.reduce((s, e) => s + e.realizationIds.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-neutral-950">

      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <LayoutGrid size={16} className="text-blue-600" />
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">نمای کلی مدل</h2>
        <div className="flex items-center gap-4 text-[11px] text-neutral-500 ms-4">
          <span><b className="text-neutral-700 dark:text-neutral-200">{totalElements}</b> عنصر</span>
          <span><b className="text-neutral-700 dark:text-neutral-200">{totalLinks}</b> لینک ردیابی</span>
          <span><b className="text-neutral-700 dark:text-neutral-200">{linkedElements}</b> عنصر لینک‌شده</span>
        </div>

        {/* Tab selector */}
        <div className="ms-auto flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => setTab("swimlane")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              tab === "swimlane"
                ? "bg-white text-neutral-800 shadow dark:bg-neutral-700 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <LayoutGrid size={12} />
            Swimlane
          </button>
          <button
            onClick={() => setTab("matrix")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              tab === "matrix"
                ? "bg-white text-neutral-800 shadow dark:bg-neutral-700 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Table2 size={12} />
            Matrix
          </button>
        </div>

        <button
          onClick={onClose}
          className="ms-3 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
        >
          <X size={16} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "swimlane" ? (
          <SwimlaneView byView={byView} allElements={allElements} navigateTo={navigateTo} />
        ) : (
          <MatrixView byView={byView} allElements={allElements} navigateTo={navigateTo} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SWIMLANE VIEW
// ─────────────────────────────────────────────────────────────────

interface ElementCardProps {
  element: ArcadiaElement;
  allElements: ArcadiaElement[];
  view: ArcadiaView;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  navigateTo: (id: string) => void;
}

function ElementCard({ element, allElements, view, hoveredId, setHoveredId, navigateTo }: ElementCardProps) {
  const m = VM[view];
  const isHovered   = hoveredId === element.id;
  const isLinkedTo  = hoveredId
    ? (element.realizationIds.includes(hoveredId) ||
       allElements.find((e) => e.id === hoveredId)?.realizationIds.includes(element.id))
    : false;

  const isHighlighted = isHovered || !!isLinkedTo;

  return (
    <div
      onMouseEnter={() => setHoveredId(element.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => navigateTo(element.id)}
      className="group cursor-pointer rounded-lg border px-2.5 py-2 transition-all"
      style={{
        background: isHighlighted ? m.bg : "white",
        borderColor: isHighlighted ? m.border : "#e5e7eb",
        boxShadow: isHighlighted ? `0 0 0 2px ${m.border}33` : undefined,
        transform: isHovered ? "scale(1.02)" : undefined,
      }}
    >
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="truncate text-[11px] font-semibold text-neutral-700 group-hover:text-neutral-900"
            style={{ color: isHighlighted ? m.color : undefined }}>
            {element.name}
          </div>
          <div className="truncate text-[9px] text-neutral-400 mt-0.5">{element.kind}</div>
        </div>
        {element.realizationIds.length > 0 && (
          <span
            className="shrink-0 rounded-full px-1 py-0.5 text-[8px] font-bold"
            style={{ background: m.headerBg, color: m.color }}
          >
            {element.realizationIds.length}↑
          </span>
        )}
        <ExternalLink size={9} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-40" />
      </div>

      {/* Mini realization arrows */}
      {isHovered && element.realizationIds.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {element.realizationIds.map((rid) => {
            const target = allElements.find((e) => e.id === rid);
            return target ? (
              <span key={rid}
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px]"
                style={{ background: m.headerBg, color: m.color }}>
                <ArrowRight size={7} />
                {target.name}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

function SwimlaneView({
  byView, allElements, navigateTo,
}: {
  byView: Map<ArcadiaView, ArcadiaElement[]>;
  allElements: ArcadiaElement[];
  navigateTo: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex h-full gap-0 overflow-x-auto">
      {VIEW_ORDER.map((view, vIdx) => {
        const m    = VM[view];
        const els  = byView.get(view) ?? [];

        return (
          <div key={view} className="flex h-full min-w-0 flex-1 flex-col"
            style={{ minWidth: 180, maxWidth: 260 }}>

            {/* Column header */}
            <div
              className="shrink-0 border-b border-e px-3 py-3"
              style={{ background: m.headerBg, borderColor: m.border + "40" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                  style={{ background: m.border }}
                >
                  {vIdx + 1}
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: m.color }}>
                    {m.label}
                  </div>
                  <div className="text-[9px]" style={{ color: m.color, opacity: 0.6 }}>
                    {els.length} عنصر
                  </div>
                </div>
              </div>
            </div>

            {/* Elements */}
            <div
              className="flex-1 overflow-y-auto border-e p-2"
              style={{ borderColor: m.border + "30" }}
            >
              {els.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[11px] text-neutral-300">
                  خالی
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {els.map((el) => (
                    <ElementCard
                      key={el.id}
                      element={el}
                      allElements={allElements}
                      view={view}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      navigateTo={navigateTo}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MATRIX VIEW — traceability between adjacent layers
// ─────────────────────────────────────────────────────────────────

function MatrixView({
  byView, allElements, navigateTo,
}: {
  byView: Map<ArcadiaView, ArcadiaElement[]>;
  allElements: ArcadiaElement[];
  navigateTo: (id: string) => void;
}) {
  // Show matrix for each adjacent pair of layers
  const pairs = useMemo(() => {
    const result: { from: ArcadiaView; to: ArcadiaView }[] = [];
    for (let i = 0; i < VIEW_ORDER.length - 1; i++) {
      result.push({ from: VIEW_ORDER[i], to: VIEW_ORDER[i + 1] });
    }
    return result;
  }, []);

  const [selectedPair, setSelectedPair] = useState(0);
  const { from, to } = pairs[selectedPair];

  const fromEls = byView.get(from) ?? [];
  const toEls   = byView.get(to)   ?? [];

  const mFrom = VM[from];
  const mTo   = VM[to];

  // Build link map: toEl.realizationIds includes fromEl.id
  const isLinked = (fromEl: ArcadiaElement, toEl: ArcadiaElement) =>
    toEl.realizationIds.includes(fromEl.id);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Pair selector */}
      <div className="flex shrink-0 gap-1 border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        {pairs.map((pair, i) => (
          <button
            key={i}
            onClick={() => setSelectedPair(i)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
              selectedPair === i
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <span style={{ color: VM[pair.from].border }}>{VM[pair.from].label}</span>
            <ArrowRight size={10} className="text-neutral-400" />
            <span style={{ color: VM[pair.to].border }}>{VM[pair.to].label}</span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex shrink-0 items-center gap-4 border-b border-neutral-100 bg-white px-5 py-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
        <span>
          <b style={{ color: mFrom.color }}>{fromEls.length}</b> عنصر در {mFrom.label}
        </span>
        <span>
          <b style={{ color: mTo.color }}>{toEls.length}</b> عنصر در {mTo.label}
        </span>
        {(() => {
          const linked = toEls.filter((t) => fromEls.some((f) => isLinked(f, t))).length;
          return (
            <span>
              <b className="text-neutral-700">{linked}</b> لینک برقرار
            </span>
          );
        })()}
      </div>

      {/* Matrix table */}
      <div className="flex-1 overflow-auto p-4">
        {fromEls.length === 0 || toEls.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            برای این جفت لایه عنصری یافت نشد
          </div>
        ) : (
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                {/* Top-left corner */}
                <th className="w-36 min-w-36 border border-neutral-200 bg-neutral-50 p-2 text-right">
                  <div className="text-[10px] font-bold uppercase" style={{ color: mTo.color }}>
                    {mTo.label} ↓
                  </div>
                  <div className="text-[9px] text-neutral-400">/ {mFrom.label} →</div>
                </th>
                {fromEls.map((fEl) => (
                  <th
                    key={fEl.id}
                    className="w-28 min-w-28 cursor-pointer border border-neutral-200 p-1.5 font-medium transition-all"
                    style={{
                      background: hoveredCol === fEl.id ? mFrom.headerBg : "#fafafa",
                      color: hoveredCol === fEl.id ? mFrom.color : "#374151",
                    }}
                    onMouseEnter={() => setHoveredCol(fEl.id)}
                    onMouseLeave={() => setHoveredCol(null)}
                    onClick={() => navigateTo(fEl.id)}
                  >
                    <div className="truncate text-center">{fEl.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {toEls.map((tEl) => (
                <tr key={tEl.id}>
                  <td
                    className="cursor-pointer border border-neutral-200 p-1.5 font-medium transition-all"
                    style={{
                      background: hoveredRow === tEl.id ? mTo.headerBg : "#fafafa",
                      color: hoveredRow === tEl.id ? mTo.color : "#374151",
                    }}
                    onMouseEnter={() => setHoveredRow(tEl.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => navigateTo(tEl.id)}
                  >
                    <div className="truncate max-w-[130px]">{tEl.name}</div>
                  </td>
                  {fromEls.map((fEl) => {
                    const linked = isLinked(fEl, tEl);
                    const rowHov = hoveredRow === tEl.id;
                    const colHov = hoveredCol === fEl.id;
                    const highlight = rowHov || colHov;

                    return (
                      <td
                        key={fEl.id}
                        className="border border-neutral-200 text-center transition-all"
                        style={{
                          background: linked
                            ? (highlight ? mTo.bg : mTo.headerBg + "80")
                            : highlight
                            ? "#f9fafb"
                            : "white",
                        }}
                      >
                        {linked ? (
                          <div className="flex items-center justify-center">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ background: mTo.border }}
                              title={`${fEl.name} → ${tEl.name}`}
                            />
                          </div>
                        ) : (
                          <span className="text-neutral-200">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="shrink-0 flex items-center gap-4 border-t border-neutral-200 bg-white px-5 py-2 text-[10px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ background: mTo.border }} />
          <span>لینک ردیابی برقرار</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-300 text-sm">·</span>
          <span>بدون لینک</span>
        </div>
        <span className="ms-auto">کلیک روی هر عنصر برای رفتن به دیاگرام</span>
      </div>
    </div>
  );
}
