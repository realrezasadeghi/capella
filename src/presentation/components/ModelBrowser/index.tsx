"use client";

import type { Project, Model, Diagram } from "@/domain/entities";

// View color badges
const VIEW_COLOR: Record<string, string> = {
  OA: "bg-amber-100 text-amber-700",
  SA: "bg-blue-100 text-blue-700",
  LA: "bg-green-100 text-green-700",
  PA: "bg-purple-100 text-purple-700",
  EPBS: "bg-slate-100 text-slate-700",
};

interface ModelBrowserProps {
  project: Project | null;
  models: Model[];
  diagrams: Diagram[];
  selectedDiagramId?: string;
  onSelectDiagram?: (diagramId: string) => void;
}

export default function ModelBrowser({
  project,
  models,
  diagrams,
  selectedDiagramId,
  onSelectDiagram,
}: ModelBrowserProps) {
  return (
    <aside className="flex h-full w-64 flex-col gap-2 border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        مرورگر مدل
      </p>

      {project ? (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {project.name}
            </p>
            {project.description && (
              <p className="mt-0.5 text-[11px] text-neutral-400 leading-4">
                {project.description}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {models.map((model) => (
              <li key={model.id}>
                <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  <span>مدل:</span>
                  <span>{model.name}</span>
                </p>
                <ul className="flex flex-col gap-0.5">
                  {diagrams
                    .filter((d) => d.modelId === model.id)
                    .map((diagram) => {
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
                                className={`rounded px-1 py-0.5 text-[10px] font-bold ${viewBadge}`}
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-xs text-neutral-400">
          هیچ پروژه‌ای بارگذاری نشده
        </p>
      )}
    </aside>
  );
}
