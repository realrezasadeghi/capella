"use client";

/**
 * Palette — Placeholder Component
 *
 * پالت عناصر زمینه‌گرا:
 *  - بسته به نوع دیاگرام فعال (OA, SA, LA, PA, EPBS)
 *    فقط عناصر مجاز آن نما را نمایش می‌دهد
 *  - عناصر با drag-and-drop به Canvas اضافه می‌شوند
 */

import type { DiagramType, ElementKind } from "@/domain/entities";

const PALETTE_ITEMS: Record<DiagramType, ElementKind[]> = {
  OEBD: ["OperationalEntity", "OperationalInteraction"],
  OAD: ["OperationalActivity", "OperationalInteraction"],
  SAB: ["SystemFunction", "SystemInterface", "SystemExchangeItem", "FunctionalChain"],
  SFCD: ["SystemFunction", "SystemInterface"],
  LAB: ["LogicalComponent", "LogicalFunction", "LogicalInterface", "LogicalExchangeItem"],
  LDFD: ["LogicalFunction", "LogicalInterface"],
  PAB: [
    "PhysicalComponent",
    "PhysicalFunction",
    "PhysicalInterface",
    "PhysicalLink",
    "PhysicalPort",
    "PhysicalExchangeItem",
  ],
  PDD: ["PhysicalComponent", "PhysicalLink"],
  EPBS: ["ConfigurationItem"],
};

interface PaletteProps {
  diagramType: DiagramType | null;
  onDragStart?: (kind: ElementKind) => void;
}

export default function Palette({ diagramType, onDragStart }: PaletteProps) {
  const items = diagramType ? PALETTE_ITEMS[diagramType] ?? [] : [];

  return (
    <aside className="flex h-full w-52 flex-col gap-2 border-l border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        پالت عناصر
      </p>
      {diagramType ? (
        <ul className="flex flex-col gap-1">
          {items.map((kind) => (
            <li
              key={kind}
              draggable
              onDragStart={() => onDragStart?.(kind)}
              className="cursor-grab rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 hover:border-blue-400 hover:bg-blue-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {kind}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-neutral-300">
          ابتدا یک دیاگرام انتخاب کنید
        </p>
      )}
    </aside>
  );
}
