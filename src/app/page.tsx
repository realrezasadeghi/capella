"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/store";
import ModelBrowser from "@/presentation/components/ModelBrowser";
import DiagramEditor from "@/presentation/components/DiagramEditor";
import Palette from "@/presentation/components/Palette";
import PropertiesPanel from "@/presentation/components/PropertiesPanel";

export default function Home() {
  const project = useEditorStore((s) => s.project);
  const models = useEditorStore((s) => s.models);
  const diagrams = useEditorStore((s) => s.diagrams);
  const elements = useEditorStore((s) => s.elements);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectDiagram = useEditorStore((s) => s.selectDiagram);

  const selectedDiagram = useMemo(
    () => diagrams.find((d) => d.id === selectedDiagramId) ?? null,
    [diagrams, selectedDiagramId]
  );

  const selectedElement = useMemo(
    () =>
      selectedElementId
        ? (elements.find((e) => e.id === selectedElementId) ?? null)
        : null,
    [elements, selectedElementId]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* ---- Top Bar ---- */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
          Arcadia Modeler
        </span>
        {selectedDiagram && (
          <>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-sm text-neutral-500">
              {project.name}
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {selectedDiagram.type}
              </span>
              {selectedDiagram.name}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
          <span>
            {selectedDiagram
              ? `${
                  elements.filter(
                    (e) => e.diagramId === selectedDiagram.id
                  ).length
                } عنصر`
              : ""}
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            v0.1 · نمونه
          </span>
        </div>
      </header>

      {/* ---- Main area ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Model Browser */}
        <ModelBrowser
          project={project}
          models={models}
          diagrams={diagrams}
          selectedDiagramId={selectedDiagramId}
          onSelectDiagram={selectDiagram}
        />

        {/* Left-center: Properties */}
        <PropertiesPanel element={selectedElement} />

        {/* Center: Diagram Editor */}
        <main className="relative flex flex-1 overflow-hidden">
          <DiagramEditor diagram={selectedDiagram} />
        </main>

        {/* Right: Palette */}
        <Palette diagramType={selectedDiagram?.type ?? null} />
      </div>
    </div>
  );
}
