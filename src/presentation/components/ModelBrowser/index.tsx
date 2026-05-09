"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import type { Project, Model, Diagram, DiagramType } from "@/domain/entities";
import { useEditorStore, DIAGRAM_VIEW } from "@/lib/store";

// ----------------------------------------------------------------
// Diagram type options for the create form
// ----------------------------------------------------------------

const DIAGRAM_OPTIONS: { type: DiagramType; label: string }[] = [
  { type: "OEBD", label: "OA — Operational Entity Breakdown" },
  { type: "OAD",  label: "OA — Operational Activity Diagram" },
  { type: "SAB",  label: "SA — System Architecture Blank" },
  { type: "SFCD", label: "SA — Functional Chain Diagram" },
  { type: "LAB",  label: "LA — Logical Architecture Blank" },
  { type: "LDFD", label: "LA — Logical Data Flow Diagram" },
  { type: "PAB",  label: "PA — Physical Architecture Blank" },
  { type: "PDD",  label: "PA — Physical Deployment Diagram" },
  { type: "EPBS", label: "EPBS — End Product Breakdown" },
];

const VIEW_COLOR: Record<string, string> = {
  OA: "bg-amber-100 text-amber-700",
  SA: "bg-blue-100 text-blue-700",
  LA: "bg-green-100 text-green-700",
  PA: "bg-purple-100 text-purple-700",
  EPBS: "bg-slate-100 text-slate-700",
};

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface ModelBrowserProps {
  project: Project | null;
  models: Model[];
  diagrams: Diagram[];
  selectedDiagramId?: string;
  onSelectDiagram?: (diagramId: string) => void;
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function ModelBrowser({
  project,
  models,
  diagrams,
  selectedDiagramId,
  onSelectDiagram,
}: ModelBrowserProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-2 border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        مرورگر مدل
      </p>

      {project ? (
        <div className="flex flex-col gap-3">
          {/* Project info */}
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {project.name}
            </p>
            {project.description && (
              <p className="mt-0.5 text-[11px] leading-4 text-neutral-400">
                {project.description}
              </p>
            )}
          </div>

          {/* Models + diagrams */}
          <ul className="flex flex-col gap-3">
            {models.map((model) => (
              <ModelSection
                key={model.id}
                model={model}
                diagrams={diagrams.filter((d) => d.modelId === model.id)}
                selectedDiagramId={selectedDiagramId}
                onSelectDiagram={onSelectDiagram}
              />
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-neutral-300">
          هیچ پروژه‌ای بارگذاری نشده
        </p>
      )}
    </aside>
  );
}

// ----------------------------------------------------------------
// Model section with collapsible diagrams + create form
// ----------------------------------------------------------------

function ModelSection({
  model,
  diagrams,
  selectedDiagramId,
  onSelectDiagram,
}: {
  model: Model;
  diagrams: Diagram[];
  selectedDiagramId?: string;
  onSelectDiagram?: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<DiagramType>("SAB");
  const createDiagram = useEditorStore((s) => s.createDiagram);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createDiagram(model.id, trimmed, newType);
    setNewName("");
    setNewType("SAB");
    setCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setCreating(false);
  };

  return (
    <li>
      {/* Model header */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500 hover:bg-neutral-50"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {model.name}
        </button>
        <button
          type="button"
          title="ایجاد دیاگرام جدید"
          onClick={() => setCreating((v) => !v)}
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-blue-600"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Create diagram form */}
      {creating && (
        <div className="mt-1 rounded-lg border border-blue-200 bg-blue-50 p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-blue-700">دیاگرام جدید</span>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded p-0.5 text-blue-400 hover:text-blue-700"
            >
              <X size={11} />
            </button>
          </div>

          <input
            type="text"
            placeholder="نام دیاگرام..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="mb-1.5 w-full rounded border border-blue-200 bg-white px-2 py-1 text-xs text-neutral-800 outline-none focus:border-blue-500"
          />

          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as DiagramType)}
            className="mb-2 w-full rounded border border-blue-200 bg-white px-2 py-1 text-[11px] text-neutral-700 outline-none"
          >
            {DIAGRAM_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="w-full rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            ایجاد
          </button>
        </div>
      )}

      {/* Diagram list */}
      {open && (
        <ul className="mt-1 flex flex-col gap-0.5 pl-3">
          {diagrams.map((diagram) => {
            const isSelected = diagram.id === selectedDiagramId;
            const viewBadge =
              VIEW_COLOR[diagram.view] ?? "bg-neutral-100 text-neutral-600";
            return (
              <li key={diagram.id}>
                <button
                  type="button"
                  onClick={() => onSelectDiagram?.(diagram.id)}
                  className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`shrink-0 rounded px-1 py-0.5 text-[10px] font-bold ${viewBadge}`}
                    >
                      {diagram.type}
                    </span>
                    <span className="truncate">{diagram.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
