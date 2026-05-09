"use client";

import { useEffect, useRef, useState } from "react";
import type { Element as ArcadiaElement } from "@/domain/entities";
import { useEditorStore } from "@/lib/store";

interface PropertiesPanelProps {
  element: ArcadiaElement | null;
}

export default function PropertiesPanel({ element }: PropertiesPanelProps) {
  if (!element) {
    return (
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          خصوصیات
        </p>
        <p className="mt-4 text-center text-[11px] text-neutral-300">
          روی یک عنصر کلیک کنید
        </p>
      </aside>
    );
  }

  return <ElementProperties element={element} />;
}

// ----------------------------------------------------------------
// Editable properties for a selected element
// ----------------------------------------------------------------

function ElementProperties({ element }: { element: ArcadiaElement }) {
  const updateName = useEditorStore((s) => s.updateElementName);
  const updateDescription = useEditorStore((s) => s.updateElementDescription);
  const deleteElement = useEditorStore((s) => s.deleteElement);
  const allConnections = useEditorStore((s) => s.connections);
  const allElements = useEditorStore((s) => s.elements);
  const selectElement = useEditorStore((s) => s.selectElement);

  const [name, setName] = useState(element.name);
  const [desc, setDesc] = useState(element.description ?? "");

  // Sync when element changes (switching selection)
  useEffect(() => {
    setName(element.name);
    setDesc(element.description ?? "");
  }, [element.id, element.name, element.description]);

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== element.name) {
      updateName(element.id, trimmed);
    } else {
      setName(element.name);
    }
  };

  const handleDescBlur = () => {
    if (desc !== (element.description ?? "")) {
      updateDescription(element.id, desc);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setName(element.name);
      e.currentTarget.blur();
    }
  };

  // Connections involving this element
  const outgoing = allConnections.filter((c) => c.sourceId === element.id);
  const incoming = allConnections.filter((c) => c.targetId === element.id);

  // Realization links (cross-view)
  const realizedElements = element.realizationIds
    .map((rid) => allElements.find((e) => e.id === rid))
    .filter(Boolean) as ArcadiaElement[];

  const label = "mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400";
  const inputClass =
    "w-full rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-800 outline-none focus:border-blue-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col gap-3 border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        خصوصیات
      </p>

      {/* Kind badge */}
      <div>
        <p className={label}>نوع</p>
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {element.kind}
        </span>
      </div>

      {/* Name */}
      <div>
        <p className={label}>نام</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <p className={label}>توضیحات</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleDescBlur}
          rows={3}
          placeholder="توضیحات اختیاری..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Position (read-only) */}
      <div>
        <p className={label}>موقعیت</p>
        <p className="text-[11px] text-neutral-400">
          x: {Math.round(element.position.x)} &nbsp; y: {Math.round(element.position.y)}
        </p>
      </div>

      {/* Connections */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div>
          <p className={label}>اتصالات</p>
          <ul className="flex flex-col gap-1">
            {outgoing.map((c) => {
              const target = allElements.find((e) => e.id === c.targetId);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer hover:text-blue-600"
                  onClick={() => target && selectElement(target.id)}
                >
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
                <li
                  key={c.id}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer hover:text-blue-600"
                  onClick={() => source && selectElement(source.id)}
                >
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

      {/* Realization links */}
      {realizedElements.length > 0 && (
        <div>
          <p className={label}>Realization</p>
          <ul className="flex flex-col gap-1">
            {realizedElements.map((el) => (
              <li
                key={el.id}
                className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer hover:text-blue-600"
                onClick={() => selectElement(el.id)}
              >
                <span className="text-purple-400">↗</span>
                <span className="truncate">{el.name}</span>
                <span className="ml-auto shrink-0 text-[10px] text-neutral-300">{el.kind.slice(0, 2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete button */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={() => deleteElement(element.id)}
          className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
        >
          حذف عنصر
        </button>
      </div>
    </aside>
  );
}
