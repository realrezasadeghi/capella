"use client";

import type { DiagramType, ElementKind } from "@/domain/entities";

// ----------------------------------------------------------------
// Palette items per diagram type
// ----------------------------------------------------------------

const PALETTE_ITEMS: Record<DiagramType, ElementKind[]> = {
  OEBD: ["OperationalEntity", "OperationalInteraction"],
  OAD: ["OperationalActivity", "OperationalInteraction"],
  SAB: [
    "SystemFunction",
    "SystemInterface",
    "SystemExchangeItem",
    "FunctionalChain",
  ],
  SFCD: ["SystemFunction", "SystemInterface"],
  LAB: [
    "LogicalComponent",
    "LogicalFunction",
    "LogicalInterface",
    "LogicalExchangeItem",
  ],
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

// Short display names
const KIND_DISPLAY: Partial<Record<ElementKind, string>> = {
  OperationalEntity: "Operational Entity",
  OperationalActivity: "Operational Activity",
  OperationalInteraction: "Interaction",
  SystemFunction: "System Function",
  SystemExchangeItem: "Exchange Item",
  SystemInterface: "System Interface",
  FunctionalChain: "Functional Chain",
  LogicalComponent: "Logical Component",
  LogicalFunction: "Logical Function",
  LogicalInterface: "Logical Interface",
  LogicalExchangeItem: "Exchange Item",
  PhysicalComponent: "Physical Component",
  PhysicalFunction: "Physical Function",
  PhysicalInterface: "Physical Interface",
  PhysicalLink: "Physical Link",
  PhysicalPort: "Physical Port",
  PhysicalExchangeItem: "Exchange Item",
  ConfigurationItem: "Config Item",
};

interface PaletteProps {
  diagramType: DiagramType | null;
}

export default function Palette({ diagramType }: PaletteProps) {
  const items = diagramType ? (PALETTE_ITEMS[diagramType] ?? []) : [];

  const handleDragStart = (e: React.DragEvent, kind: ElementKind) => {
    e.dataTransfer.setData("application/arcadia-kind", kind);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-52 flex-col gap-2 border-l border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        پالت عناصر
      </p>

      {diagramType ? (
        <>
          <p className="text-[10px] text-neutral-400">
            برای افزودن، عنصر را روی بوم رها کنید
          </p>
          <ul className="flex flex-col gap-1">
            {items.map((kind) => (
              <li
                key={kind}
                draggable
                onDragStart={(e) => handleDragStart(e, kind)}
                className="cursor-grab select-none rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-blue-400 hover:bg-blue-50 active:cursor-grabbing dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                {KIND_DISPLAY[kind] ?? kind}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-2 text-xs text-neutral-400">
          ابتدا یک دیاگرام انتخاب کنید
        </p>
      )}
    </aside>
  );
}
