"use client";

import { useMemo, useState } from "react";
import { X, Link2, Link2Off, ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react";
import type { Element as ArcadiaElement, ArcadiaView } from "@/domain/entities";
import { useEditorStore, VIEW_ORDER } from "@/lib/store";

// ── Layer metadata ────────────────────────────────────────────────
const VIEW_META: Record<ArcadiaView, { label: string; short: string; color: string; bg: string; border: string }> = {
  OA:   { label:"Operational",  short:"OA",   color:"#92400e", bg:"#fffbeb", border:"#f59e0b" },
  SA:   { label:"System",       short:"SA",   color:"#1e3a8a", bg:"#eff6ff", border:"#3b82f6" },
  LA:   { label:"Logical",      short:"LA",   color:"#064e3b", bg:"#ecfdf5", border:"#10b981" },
  PA:   { label:"Physical",     short:"PA",   color:"#2e1065", bg:"#f5f3ff", border:"#8b5cf6" },
  EPBS: { label:"EPBS",         short:"EPBS", color:"#0f172a", bg:"#f8fafc", border:"#64748b" },
};

// ── Name similarity (token overlap) ──────────────────────────────
function similarity(a: string, b: string): number {
  if (a.toLowerCase() === b.toLowerCase()) return 1;
  const tok = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z\u0600-\u06ff\s]/gi, " ").split(/\s+/).filter(Boolean));
  const aT = tok(a), bT = tok(b);
  if (!aT.size || !bT.size) return 0;
  let shared = 0;
  for (const t of aT) if (bT.has(t)) shared++;
  return shared / Math.max(aT.size, bT.size);
}

// ── Props ─────────────────────────────────────────────────────────
interface TraceabilityPanelProps {
  element: ArcadiaElement;
  onClose: () => void;
}

export default function TraceabilityPanel({ element, onClose }: TraceabilityPanelProps) {
  const allElements           = useEditorStore((s) => s.elements);
  const diagrams              = useEditorStore((s) => s.diagrams);
  const addRealizationLink    = useEditorStore((s) => s.addRealizationLink);
  const removeRealizationLink = useEditorStore((s) => s.removeRealizationLink);
  const navigateTo            = useEditorStore((s) => s.navigateTo);

  // Current element's view
  const currentDiagram = diagrams.find((d) => d.id === element.diagramId);
  const currentView    = currentDiagram?.view ?? "SA";
  const currentIdx     = VIEW_ORDER.indexOf(currentView);

  // Build full trace chain (up + down from current)
  const traceIds = useMemo(() => {
    const ids = new Set<string>();
    const upQ = [element.id];
    while (upQ.length) {
      const cur = upQ.shift()!;
      const el = allElements.find((e) => e.id === cur);
      if (!el) continue;
      for (const rid of el.realizationIds) {
        if (!ids.has(rid)) { ids.add(rid); upQ.push(rid); }
      }
    }
    const downQ = [element.id];
    while (downQ.length) {
      const cur = downQ.shift()!;
      for (const el of allElements.filter((e) => e.realizationIds.includes(cur))) {
        if (!ids.has(el.id)) { ids.add(el.id); downQ.push(el.id); }
      }
    }
    return ids;
  }, [element.id, element.realizationIds, allElements]);

  // For each view, compute: linked elements + smart suggestions
  const layers = useMemo(() => {
    return VIEW_ORDER.map((view, idx) => {
      const viewDiagramIds = new Set(
        diagrams.filter((d) => d.view === view).map((d) => d.id)
      );
      const viewElements = allElements.filter((e) => viewDiagramIds.has(e.diagramId));

      const linked = viewElements.filter((e) => traceIds.has(e.id));

      // Realization direction:
      // "above" (idx < currentIdx) → element realizes them (element.realizationIds includes their id)
      // "below" (idx > currentIdx) → they realize element
      const isAbove   = idx < currentIdx;
      const isCurrent = idx === currentIdx;
      const isBelow   = idx > currentIdx;

      const linkedIds = new Set(linked.map((e) => e.id));
      const candidates = viewElements.filter((e) => e.id !== element.id && !linkedIds.has(e.id));

      // Smart suggestions: sort by name similarity
      const suggestions = candidates
        .map((e) => ({ element: e, score: similarity(element.name, e.name) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      return { view, meta: VIEW_META[view], idx, isAbove, isCurrent, isBelow, linked, suggestions };
    });
  }, [VIEW_ORDER, diagrams, allElements, traceIds, currentIdx, element]);

  const [collapsedViews, setCollapsedViews] = useState<Set<ArcadiaView>>(new Set());
  const toggleCollapse = (view: ArcadiaView) => {
    setCollapsedViews((prev) => {
      const next = new Set(prev);
      next.has(view) ? next.delete(view) : next.add(view);
      return next;
    });
  };

  const handleLink = (targetId: string, isAbove: boolean) => {
    if (isAbove) {
      addRealizationLink(element.id, targetId);
    } else {
      // Below: the target realizes element
      addRealizationLink(targetId, element.id);
    }
  };

  const handleUnlink = (targetId: string, isAbove: boolean) => {
    if (isAbove) {
      removeRealizationLink(element.id, targetId);
    } else {
      removeRealizationLink(targetId, element.id);
    }
  };

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-blue-600" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">ردیابی هوشمند</span>
        </div>
        <button onClick={onClose}
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800">
          <X size={13} />
        </button>
      </div>

      {/* Current element pill */}
      <div className="shrink-0 border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
        <div
          style={{
            background: VIEW_META[currentView].bg,
            borderColor: VIEW_META[currentView].border,
            color: VIEW_META[currentView].color,
          }}
          className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
        >
          <span className="text-[10px] font-bold uppercase opacity-70">{VIEW_META[currentView].short}</span>
          <span className="flex-1 truncate text-[12px] font-semibold">{element.name}</span>
          <span className="shrink-0 text-[10px] opacity-50">{element.kind}</span>
        </div>
      </div>

      {/* Layer chain */}
      <div className="flex flex-1 flex-col gap-0 overflow-y-auto">
        {layers.map(({ view, meta, isAbove, isCurrent, isBelow, linked, suggestions }, idx) => {
          if (isCurrent) {
            return (
              <div key={view} className="relative flex items-center gap-2 px-3 py-2">
                <div className="absolute left-[26px] top-0 h-full w-px bg-neutral-100 dark:bg-neutral-800" />
                <div
                  className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: meta.border }}
                >
                  {meta.short[0]}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{ background: meta.bg, color: meta.color }}>
                  فعلی
                </span>
              </div>
            );
          }

          const hasContent = linked.length > 0 || suggestions.length > 0;
          const isCollapsed = collapsedViews.has(view);

          return (
            <div key={view} className="relative border-b border-neutral-50 dark:border-neutral-900">
              {/* Vertical connector line */}
              <div className="absolute left-[26px] top-0 h-full w-px bg-neutral-100 dark:bg-neutral-800" />

              {/* Layer header */}
              <button
                onClick={() => hasContent && toggleCollapse(view)}
                className="relative z-10 flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div
                  className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[7px] font-bold"
                  style={{ borderColor: linked.length > 0 ? meta.border : "#d1d5db", color: meta.color }}
                >
                  {meta.short[0]}
                </div>
                <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  {meta.label}
                </span>
                {isAbove && <span className="text-[9px] text-neutral-400">بالاتر</span>}
                {isBelow && <span className="text-[9px] text-neutral-400">پایین‌تر</span>}
                <span className="shrink-0 text-[10px] text-neutral-400">
                  {linked.length > 0 && (
                    <span style={{ color: meta.border }} className="font-bold">{linked.length} لینک</span>
                  )}
                  {linked.length === 0 && suggestions.length > 0 && (
                    <span className="text-amber-500">{suggestions.length} پیشنهاد</span>
                  )}
                </span>
                {hasContent && (
                  <span className="ml-1 text-neutral-300">
                    {isCollapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                  </span>
                )}
              </button>

              {/* Expandable content */}
              {!isCollapsed && (
                <div className="pb-2 ps-9 pe-3">
                  {/* Linked elements */}
                  {linked.map((el) => (
                    <div key={el.id}
                      className="group mb-1 flex items-center gap-1.5 rounded-md px-2 py-1"
                      style={{ background: meta.bg }}>
                      <Link2 size={10} style={{ color: meta.border }} className="shrink-0" />
                      <button
                        onClick={() => navigateTo(el.id)}
                        className="flex-1 truncate text-start text-[11px] font-medium hover:underline"
                        style={{ color: meta.color }}
                      >
                        {el.name}
                      </button>
                      <button
                        onClick={() => handleUnlink(el.id, isAbove)}
                        className="shrink-0 rounded p-0.5 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                        title="حذف لینک"
                      >
                        <Link2Off size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Smart suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-1.5">
                      {linked.length > 0 && (
                        <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                          پیشنهادهای دیگر
                        </div>
                      )}
                      {suggestions.map(({ element: sEl, score }) => (
                        <div key={sEl.id}
                          className="group mb-1 flex items-center gap-1.5 rounded-md border border-dashed border-neutral-200 px-2 py-1 hover:border-neutral-300 dark:border-neutral-700">
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-[11px] text-neutral-600 dark:text-neutral-400">
                              {sEl.name}
                            </div>
                            {score > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="h-1 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                                  <div
                                    className="h-1 rounded-full bg-amber-400 transition-all"
                                    style={{ width: `${Math.round(score * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-neutral-400">{Math.round(score * 100)}%</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleLink(sEl.id, isAbove)}
                            className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-all hover:opacity-100"
                            style={{
                              borderColor: meta.border,
                              color: meta.color,
                              background: meta.bg,
                              opacity: 0.7,
                            }}
                            title="افزودن لینک"
                          >
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {linked.length === 0 && suggestions.length === 0 && (
                    <p className="text-[11px] text-neutral-300 py-1">
                      هیچ عنصری در این لایه یافت نشد
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="shrink-0 border-t border-neutral-100 px-3 py-2 dark:border-neutral-800">
        <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
          پیشنهادها بر اساس شباهت نام عناصر محاسبه می‌شوند
        </p>
      </div>
    </div>
  );
}
