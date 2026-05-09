"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Upload, RotateCcw, CheckCircle2 } from "lucide-react";
import { useEditorStore, type ModelSnapshot } from "@/lib/store";
import { useLiveValidation } from "@/lib/useLiveValidation";
import ModelBrowser   from "@/presentation/components/ModelBrowser";
import DiagramEditor  from "@/presentation/components/DiagramEditor";
import Palette        from "@/presentation/components/Palette";
import PropertiesPanel from "@/presentation/components/PropertiesPanel";
import ValidationBar  from "@/presentation/components/ValidationBar";

export default function Home() {
  // ---- Live validation (debounced, silent) ----
  useLiveValidation();

  // ---- Store selectors ----
  const project          = useEditorStore((s) => s.project);
  const models           = useEditorStore((s) => s.models);
  const diagrams         = useEditorStore((s) => s.diagrams);
  const elements         = useEditorStore((s) => s.elements);
  const connections      = useEditorStore((s) => s.connections);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectDiagram    = useEditorStore((s) => s.selectDiagram);
  const loadModel        = useEditorStore((s) => s.loadModel);
  const resetToMock      = useEditorStore((s) => s.resetToMock);

  const selectedDiagram = useMemo(
    () => diagrams.find((d) => d.id === selectedDiagramId) ?? null,
    [diagrams, selectedDiagramId]
  );

  const selectedElement = useMemo(
    () => selectedElementId ? (elements.find((e) => e.id === selectedElementId) ?? null) : null,
    [elements, selectedElementId]
  );

  const diagramElementCount = selectedDiagram
    ? elements.filter((e) => e.diagramId === selectedDiagram.id).length
    : 0;

  // ---- Export ----
  const [justSaved, setJustSaved] = useState(false);

  const handleExport = () => {
    const snapshot: ModelSnapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      project, models, diagrams, elements, connections,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${project.name.replace(/\s+/g, "_")}.arcadia.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // ---- Import ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        if (!raw.project || !Array.isArray(raw.models) || !Array.isArray(raw.diagrams)
          || !Array.isArray(raw.elements) || !Array.isArray(raw.connections)) {
          throw new Error("ساختار فایل معتبر نیست");
        }
        loadModel(raw as ModelSnapshot);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "فایل قابل خواندن نیست");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const btnBase = "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors";

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900">

      {/* ---- Top Bar ---- */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950">
        <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
          Arcadia Modeler
        </span>

        {selectedDiagram && (
          <>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-500">{project.name}</span>
            <span className="text-neutral-300">/</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                {selectedDiagram.type}
              </span>
              {selectedDiagram.name}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {selectedDiagram && (
            <span className="text-xs text-neutral-400">{diagramElementCount} عنصر</span>
          )}

          {justSaved ? (
            <span className="flex items-center gap-1 text-[11px] text-green-600">
              <CheckCircle2 size={12} /> ذخیره شد
            </span>
          ) : (
            <span className="text-[10px] text-neutral-300">Auto-save فعال</span>
          )}

          <div className="h-4 w-px bg-neutral-200" />

          <button onClick={handleExport}
            className={`${btnBase} border border-neutral-200 text-neutral-600 hover:bg-neutral-50`}>
            <Download size={13} /> Export
          </button>

          <button onClick={() => { setImportError(null); fileRef.current?.click(); }}
            className={`${btnBase} border border-neutral-200 text-neutral-600 hover:bg-neutral-50`}>
            <Upload size={13} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json,.arcadia.json"
            className="hidden" onChange={handleFileChange} />

          <button
            onClick={() => { if (confirm("مدل به حالت اولیه بازنشانی می‌شود. ادامه می‌دهید؟")) resetToMock(); }}
            className={`${btnBase} text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700`}
            title="بازنشانی به داده‌های نمونه">
            <RotateCcw size={12} />
          </button>
        </div>
      </header>

      {/* ---- Import error notification ---- */}
      {importError && (
        <div className="flex shrink-0 items-center justify-between border-b border-red-200 bg-red-50 px-4 py-2">
          <span className="text-xs text-red-600">خطا در بارگذاری: {importError}</span>
          <button onClick={() => setImportError(null)} className="text-xs text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* ---- Main panels ---- */}
      <div className="flex flex-1 overflow-hidden">
        <ModelBrowser
          project={project} models={models} diagrams={diagrams}
          selectedDiagramId={selectedDiagramId} onSelectDiagram={selectDiagram}
        />
        <PropertiesPanel element={selectedElement} />
        <main className="relative flex flex-1 overflow-hidden">
          <DiagramEditor diagram={selectedDiagram} />
        </main>
        <Palette diagramType={selectedDiagram?.type ?? null} />
      </div>

      {/* ---- Validation Bar (bottom) ---- */}
      <ValidationBar />
    </div>
  );
}
