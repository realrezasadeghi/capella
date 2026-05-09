"use client";

/**
 * ModelBrowser — Placeholder Component
 *
 * مرورگر مفهومی مدل (پانل کناری چپ):
 *  - درخت کامل مدل را نمایش می‌دهد (Project > Model > Diagram > Element)
 *  - با کلیک روی هر عنصر، تمام Traceها و Realizationها برجسته می‌شوند
 *  - قابلیت انتقال سریع میان نماهای مختلف
 */

import type { Project, Model, Diagram } from "@/domain/entities";

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
        <div>
          <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {project.name}
          </p>
          <ul className="flex flex-col gap-1">
            {models.map((model) => (
              <li key={model.id}>
                <span className="text-xs font-semibold text-neutral-500">
                  {model.name}
                </span>
                <ul className="mt-1 flex flex-col gap-0.5 pl-3">
                  {diagrams
                    .filter((d) => d.modelId === model.id)
                    .map((diagram) => (
                      <li
                        key={diagram.id}
                        onClick={() => onSelectDiagram?.(diagram.id)}
                        className={`cursor-pointer rounded px-2 py-1 text-xs ${
                          diagram.id === selectedDiagramId
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        }`}
                      >
                        [{diagram.type}] {diagram.name}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-xs text-neutral-300">
          هیچ پروژه‌ای بارگذاری نشده
        </p>
      )}
    </aside>
  );
}
