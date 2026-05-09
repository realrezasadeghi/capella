"use client";

import type { Element as ArcadiaElement } from "@/domain/entities";
import { useEditorStore } from "@/lib/store";

interface PropertiesPanelProps {
  element: ArcadiaElement | null;
}

export default function PropertiesPanel({ element }: PropertiesPanelProps) {
  const deleteElement = useEditorStore((s) => s.deleteElement);

  if (!element) {
    return (
      <div className="flex h-full w-56 flex-col border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          خصوصیات
        </p>
        <p className="mt-3 text-xs text-neutral-400">
          روی یک عنصر کلیک کنید
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-56 flex-col gap-3 border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        خصوصیات
      </p>

      <div className="flex flex-col gap-2">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase text-neutral-400">
            نوع
          </p>
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {element.kind}
          </p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase text-neutral-400">
            نام
          </p>
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {element.name}
          </p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase text-neutral-400">
            موقعیت
          </p>
          <p className="text-xs text-neutral-500">
            x: {Math.round(element.position.x)} &nbsp; y:{" "}
            {Math.round(element.position.y)}
          </p>
        </div>

        {element.realizationIds.length > 0 && (
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase text-neutral-400">
              Realization Links
            </p>
            <p className="text-xs text-neutral-500">
              {element.realizationIds.length} پیوند
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button
          type="button"
          onClick={() => deleteElement(element.id)}
          className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        >
          حذف عنصر
        </button>
      </div>
    </div>
  );
}
