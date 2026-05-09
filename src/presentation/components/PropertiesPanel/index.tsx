"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Link2Off, ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import type { Element as ArcadiaElement, ArcadiaView, Diagram } from "@/domain/entities";
import { useEditorStore, VIEW_ORDER } from "@/lib/store";

// ================================================================
// Public component
// ================================================================

interface PropertiesPanelProps {
  element: ArcadiaElement | null;
}

export default function PropertiesPanel({ element }: PropertiesPanelProps) {
  const [tab, setTab] = useState<"props" | "trace">("props");

  // Reset to props tab when element changes
  useEffect(() => { setTab("props"); }, [element?.id]);

  if (!element) {
    return (
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">خصوصیات</p>
        <p className="mt-4 text-center text-[11px] text-neutral-300">روی یک عنصر کلیک کنید</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        <TabBtn active={tab === "props"} onClick={() => setTab("props")}>خصوصیات</TabBtn>
        <TabBtn active={tab === "trace"} onClick={() => setTab("trace")}>ردیابی ⬡</TabBtn>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "props"  ? <PropertiesTab element={element} /> : <TraceTab element={element} />}
      </div>
    </aside>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-2 py-2 text-[11px] font-medium transition-colors ${
        active
          ? "border-b-2 border-blue-600 text-blue-700"
          : "text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}

// ================================================================
// Tab 1 — Properties
// ================================================================

function PropertiesTab({ element }: { element: ArcadiaElement }) {
  const updateName        = useEditorStore((s) => s.updateElementName);
  const updateDescription = useEditorStore((s) => s.updateElementDescription);
  const deleteElement     = useEditorStore((s) => s.deleteElement);
  const allConnections    = useEditorStore((s) => s.connections);
  const allElements       = useEditorStore((s) => s.elements);
  const selectElement     = useEditorStore((s) => s.selectElement);

  const [name, setName] = useState(element.name);
  const [desc, setDesc] = useState(element.description ?? "");

  useEffect(() => {
    setName(element.name);
    setDesc(element.description ?? "");
  }, [element.id, element.name, element.description]);

  const handleNameBlur = () => {
    const t = name.trim();
    if (t && t !== element.name) updateName(element.id, t);
    else setName(element.name);
  };

  const handleNameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") { setName(element.name); e.currentTarget.blur(); }
  };

  const outgoing = allConnections.filter((c) => c.sourceId === element.id);
  const incoming = allConnections.filter((c) => c.targetId === element.id);

  const lbl = "mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400";
  const inp = "w-full rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-800 outline-none focus:border-blue-400 focus:bg-white";

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <p className={lbl}>نوع</p>
        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
          {element.kind}
        </span>
      </div>

      <div>
        <p className={lbl}>نام</p>
        <input type="text" value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur} onKeyDown={handleNameKey}
          className={inp} />
      </div>

      <div>
        <p className={lbl}>توضیحات</p>
        <textarea value={desc} rows={3}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={() => { if (desc !== (element.description ?? "")) updateDescription(element.id, desc); }}
          placeholder="توضیحات اختیاری..."
          className={`${inp} resize-none`} />
      </div>

      <div>
        <p className={lbl}>موقعیت</p>
        <p className="text-[11px] text-neutral-400">
          x: {Math.round(element.position.x)} &nbsp; y: {Math.round(element.position.y)}
        </p>
      </div>

      {(outgoing.length > 0 || incoming.length > 0) && (
        <div>
          <p className={lbl}>اتصالات</p>
          <ul className="flex flex-col gap-1">
            {outgoing.map((c) => {
              const target = allElements.find((e) => e.id === c.targetId);
              return (
                <li key={c.id}
                  className="flex cursor-pointer items-center gap-1 text-[11px] text-neutral-500 hover:text-blue-600"
                  onClick={() => target && selectElement(target.id)}>
                  <span className="text-neutral-300">→</span>
                  <span className="truncate">{target?.name ?? c.targetId}</span>
                  <span className="ml-auto shrink-0 rounded bg-neutral-100 px-1 text-[10px] text-neutral-400">
                    {c.kind.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </li>
              );
            })}
            {incoming.map((c) => {
              const source = allElements.find((e) => e.id === c.sourceId);
              return (
                <li key={c.id}
                  className="flex cursor-pointer items-center gap-1 text-[11px] text-neutral-500 hover:text-blue-600"
                  onClick={() => source && selectElement(source.id)}>
                  <span className="text-neutral-300">←</span>
                  <span className="truncate">{source?.name ?? c.sourceId}</span>
                  <span className="ml-auto shrink-0 rounded bg-neutral-100 px-1 text-[10px] text-neutral-400">
                    {c.kind.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-2">
        <button type="button" onClick={() => deleteElement(element.id)}
          className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
          حذف عنصر
        </button>
      </div>
    </div>
  );
}

// ================================================================
// Tab 2 — Traceability
// ================================================================

interface TraceNode {
  element: ArcadiaElement;
  diagram: Diagram;
  isCurrent: boolean;
}

function buildTraceChain(
  elementId: string,
  allElements: ArcadiaElement[],
  diagrams: Diagram[]
): { view: ArcadiaView; nodes: TraceNode[] }[] {
  const diagramMap = new Map(diagrams.map((d) => [d.id, d]));
  const connected = new Set<string>([elementId]);

  // BFS up
  const upQ = [elementId];
  while (upQ.length) {
    const cur = upQ.shift()!;
    const el = allElements.find((e) => e.id === cur);
    if (!el) continue;
    for (const rid of el.realizationIds) {
      if (!connected.has(rid)) { connected.add(rid); upQ.push(rid); }
    }
  }

  // BFS down
  const downQ = [elementId];
  while (downQ.length) {
    const cur = downQ.shift()!;
    const lowers = allElements.filter((e) => e.realizationIds.includes(cur));
    for (const l of lowers) {
      if (!connected.has(l.id)) { connected.add(l.id); downQ.push(l.id); }
    }
  }

  // Group by view
  const groups = new Map<ArcadiaView, TraceNode[]>();
  for (const id of connected) {
    const el = allElements.find((e) => e.id === id);
    if (!el) continue;
    const diagram = diagramMap.get(el.diagramId);
    if (!diagram) continue;
    const view = diagram.view;
    if (!groups.has(view)) groups.set(view, []);
    groups.get(view)!.push({ element: el, diagram, isCurrent: id === elementId });
  }

  return VIEW_ORDER
    .filter((v) => groups.has(v))
    .map((v) => ({ view: v, nodes: groups.get(v)! }));
}

const VIEW_LABEL: Record<ArcadiaView, string> = {
  OA: "Operational", SA: "System", LA: "Logical", PA: "Physical", EPBS: "EPBS",
};

const VIEW_COLOR: Record<ArcadiaView, { bg: string; text: string; border: string }> = {
  OA:   { bg: "#fffbeb", text: "#92400e", border: "#f59e0b" },
  SA:   { bg: "#eff6ff", text: "#1e3a8a", border: "#3b82f6" },
  LA:   { bg: "#f0fdf4", text: "#14532d", border: "#22c55e" },
  PA:   { bg: "#faf5ff", text: "#3b0764", border: "#a855f7" },
  EPBS: { bg: "#f8fafc", text: "#0f172a", border: "#64748b" },
};

function TraceTab({ element }: { element: ArcadiaElement }) {
  const allElements          = useEditorStore((s) => s.elements);
  const diagrams             = useEditorStore((s) => s.diagrams);
  const navigateTo           = useEditorStore((s) => s.navigateTo);
  const addRealizationLink   = useEditorStore((s) => s.addRealizationLink);
  const removeRealizationLink = useEditorStore((s) => s.removeRealizationLink);

  const chain = useMemo(
    () => buildTraceChain(element.id, allElements, diagrams),
    [element.id, element.realizationIds, allElements, diagrams] // eslint-disable-line
  );

  // Determine current element's view
  const currentDiagram = diagrams.find((d) => d.id === element.diagramId);
  const currentView    = currentDiagram?.view;

  // Adjacent views for linking
  const currentViewIdx  = currentView ? VIEW_ORDER.indexOf(currentView) : -1;
  const aboveView: ArcadiaView | null = currentViewIdx > 0 ? VIEW_ORDER[currentViewIdx - 1] : null;
  const belowView: ArcadiaView | null = currentViewIdx < VIEW_ORDER.length - 1 ? VIEW_ORDER[currentViewIdx + 1] : null;

  // Elements that can be linked FROM (above view — this element would realize them)
  const linkableAbove = useMemo(() => {
    if (!aboveView) return [];
    return allElements.filter((el) => {
      const d = diagrams.find((d) => d.id === el.diagramId);
      return d?.view === aboveView && !element.realizationIds.includes(el.id);
    });
  }, [aboveView, allElements, diagrams, element.realizationIds]);

  // Elements below that already realize this element (read-only, for display)
  const realizersBelow = useMemo(() => {
    if (!belowView) return [];
    return allElements.filter(
      (el) =>
        el.realizationIds.includes(element.id) &&
        diagrams.find((d) => d.id === el.diagramId)?.view === belowView
    );
  }, [belowView, allElements, diagrams, element.id]);

  const [newLinkTarget, setNewLinkTarget] = useState("");

  const handleAddLink = () => {
    if (!newLinkTarget) return;
    addRealizationLink(element.id, newLinkTarget);
    setNewLinkTarget("");
  };

  const lbl = "mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400";

  return (
    <div className="flex flex-col gap-4 p-3">

      {/* ---- Chain visualization ---- */}
      <div>
        <p className={lbl}>زنجیره ردیابی</p>
        {chain.length === 0 ? (
          <p className="text-[11px] text-neutral-300">هیچ لینک Realization تعریف نشده</p>
        ) : (
          <div className="flex flex-col gap-1">
            {chain.map(({ view, nodes }, idx) => {
              const vc = VIEW_COLOR[view];
              return (
                <div key={view}>
                  {/* Connector line between levels */}
                  {idx > 0 && (
                    <div className="my-0.5 ml-3 h-3 w-px bg-neutral-200" />
                  )}
                  <div
                    style={{ background: vc.bg, borderColor: vc.border, color: vc.text }}
                    className="rounded-lg border px-2 py-1.5"
                  >
                    <div className="mb-1 flex items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                        {VIEW_LABEL[view]}
                      </span>
                      <span className="text-[9px] opacity-40 ml-1">[{view}]</span>
                    </div>
                    {nodes.map(({ element: el, diagram, isCurrent }) => (
                      <div key={el.id}
                        onClick={() => !isCurrent && navigateTo(el.id)}
                        className={`flex items-center gap-1.5 rounded px-1 py-0.5 text-[11px] font-medium ${
                          isCurrent
                            ? "font-bold"
                            : "cursor-pointer opacity-80 hover:opacity-100 hover:underline"
                        }`}
                      >
                        {isCurrent ? (
                          <span className="shrink-0 text-[9px] font-black">●</span>
                        ) : (
                          <ArrowUpRight size={11} className="shrink-0 opacity-60" />
                        )}
                        <span className="truncate">{el.name}</span>
                        {!isCurrent && (
                          <span className="ml-auto shrink-0 text-[9px] opacity-50">
                            {diagram.type}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Manages: this element realizes ---- */}
      <div>
        <p className={lbl}>این عنصر محقق می‌کند</p>

        {element.realizationIds.length === 0 ? (
          <p className="mb-2 text-[11px] text-neutral-300">بدون لینک</p>
        ) : (
          <ul className="mb-2 flex flex-col gap-1">
            {element.realizationIds.map((rid) => {
              const target = allElements.find((e) => e.id === rid);
              const targetDiagram = target ? diagrams.find((d) => d.id === target.diagramId) : null;
              return (
                <li key={rid} className="flex items-center gap-1 rounded border border-neutral-100 bg-neutral-50 px-2 py-1">
                  <span
                    className="flex-1 cursor-pointer truncate text-[11px] text-neutral-700 hover:text-blue-600"
                    onClick={() => target && navigateTo(target.id)}
                  >
                    {target?.name ?? rid}
                    {targetDiagram && (
                      <span className="ml-1 text-[10px] text-neutral-400">[{targetDiagram.type}]</span>
                    )}
                  </span>
                  <button
                    onClick={() => removeRealizationLink(element.id, rid)}
                    className="shrink-0 rounded p-0.5 text-neutral-300 hover:text-red-500"
                    title="حذف لینک"
                  >
                    <Link2Off size={12} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Add new realization link */}
        {aboveView && linkableAbove.length > 0 && (
          <div className="flex gap-1">
            <select
              value={newLinkTarget}
              onChange={(e) => setNewLinkTarget(e.target.value)}
              className="flex-1 rounded border border-neutral-200 bg-white px-1.5 py-1 text-[11px] text-neutral-700 outline-none focus:border-blue-400"
            >
              <option value="">افزودن لینک به [{VIEW_LABEL[aboveView]}]...</option>
              {linkableAbove.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.name} ({el.kind})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddLink}
              disabled={!newLinkTarget}
              className="shrink-0 rounded border border-blue-200 bg-blue-50 px-2 text-[11px] text-blue-600 hover:bg-blue-100 disabled:opacity-40"
            >
              <Link2 size={12} />
            </button>
          </div>
        )}

        {aboveView && linkableAbove.length === 0 && element.realizationIds.length === 0 && (
          <p className="text-[11px] text-neutral-300">
            هیچ عنصر [{VIEW_LABEL[aboveView]}] برای لینک وجود ندارد
          </p>
        )}
      </div>

      {/* ---- Realized by (below view, read-only) ---- */}
      {belowView && (
        <div>
          <p className={lbl}>محقق می‌شود توسط [{VIEW_LABEL[belowView]}]</p>
          {realizersBelow.length === 0 ? (
            <p className="text-[11px] text-neutral-300">هنوز هیچ عنصری تحقق نداده</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {realizersBelow.map((el) => {
                const d = diagrams.find((d) => d.id === el.diagramId);
                return (
                  <li key={el.id}
                    className="flex cursor-pointer items-center gap-1 rounded border border-neutral-100 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700 hover:text-blue-600"
                    onClick={() => navigateTo(el.id)}>
                    <ArrowUpRight size={11} className="shrink-0 opacity-60 rotate-90" />
                    <span className="truncate">{el.name}</span>
                    {d && <span className="ml-auto shrink-0 text-[10px] text-neutral-400">[{d.type}]</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}
