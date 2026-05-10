"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Download, Upload, RotateCcw, CheckCircle2, ChevronRight,
  Layers, LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useProjectStore } from "@/lib/projectStore";
import { useEditorStore, type ModelSnapshot } from "@/lib/store";
import { useLiveValidation } from "@/lib/useLiveValidation";
import ModelBrowser from "@/presentation/components/ModelBrowser";
import DiagramEditor from "@/presentation/components/DiagramEditor";
import Palette from "@/presentation/components/Palette";
import PropertiesPanel from "@/presentation/components/PropertiesPanel";
import ValidationBar from "@/presentation/components/ValidationBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import AuthGuard from "@/components/AuthGuard";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function EditorContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const modelId = params.modelId as string;

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const model = useProjectStore((s) => s.models.find((m) => m.id === modelId));
  const updateModelStats = useProjectStore((s) => s.updateModelStats);

  // Editor store
  useLiveValidation();

  const storeProject      = useEditorStore((s) => s.project);
  const models            = useEditorStore((s) => s.models);
  const diagrams          = useEditorStore((s) => s.diagrams);
  const elements          = useEditorStore((s) => s.elements);
  const connections       = useEditorStore((s) => s.connections);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectDiagram     = useEditorStore((s) => s.selectDiagram);
  const loadModel         = useEditorStore((s) => s.loadModel);
  const resetToMock       = useEditorStore((s) => s.resetToMock);

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

  // Sync element/diagram count to projectStore
  useEffect(() => {
    updateModelStats(modelId, diagrams.length, elements.length);
  }, [diagrams.length, elements.length, modelId, updateModelStats]);

  // Redirect if project/model not found
  useEffect(() => {
    if (!project || !model) router.replace("/dashboard");
  }, [project, model, router]);

  // ---- Export ----
  const [justSaved, setJustSaved] = useState(false);

  const handleExport = () => {
    const snapshot: ModelSnapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      project: storeProject, models, diagrams, elements, connections,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${storeProject.name.replace(/\s+/g, "_")}.arcadia.json`;
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

  const handleLogout = () => { logout(); router.replace("/"); };

  if (!project || !model) return null;

  const btnBase = "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors";

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-100">

      {/* ---- Top Bar ---- */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-3">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1">
          <Link href="/" className="shrink-0">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-800 transition-colors truncate hidden sm:block">
            پروژه‌ها
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0 hidden sm:block" />
          <Link
            href={`/project/${projectId}`}
            className="text-neutral-500 hover:text-neutral-800 transition-colors truncate max-w-[80px] sm:max-w-[120px]"
          >
            <span className="mr-1">{project.icon}</span>
            {project.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-800 truncate max-w-[80px] sm:max-w-[120px]">
            {model.name}
          </span>

          {selectedDiagram && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="flex items-center gap-1 text-neutral-800 shrink-0">
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                  {selectedDiagram.type}
                </span>
                <span className="truncate max-w-[80px] hidden md:block">{selectedDiagram.name}</span>
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedDiagram && (
            <span className="text-xs text-neutral-400 hidden md:block">{diagramElementCount} عنصر</span>
          )}

          {justSaved ? (
            <span className="flex items-center gap-1 text-[11px] text-green-600">
              <CheckCircle2 size={12} /> ذخیره شد
            </span>
          ) : (
            <span className="text-[10px] text-neutral-300 hidden sm:block">Auto-save</span>
          )}

          <div className="h-4 w-px bg-neutral-200 mx-0.5" />

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
            onClick={() => { if (confirm("مدل به حالت اولیه بازنشانی می‌شود؟")) resetToMock(); }}
            className={`${btnBase} text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700`}
            title="بازنشانی به داده‌های نمونه">
            <RotateCcw size={12} />
          </button>

          <div className="h-4 w-px bg-neutral-200 mx-0.5" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-neutral-100 transition-colors">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(currentUser?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-neutral-600 hidden lg:block">{currentUser?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <Layers size={13} />
                داشبورد
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                <LogOut size={13} />
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ---- Import error ---- */}
      {importError && (
        <div className="flex shrink-0 items-center justify-between border-b border-red-200 bg-red-50 px-4 py-2">
          <span className="text-xs text-red-600">خطا در بارگذاری: {importError}</span>
          <button onClick={() => setImportError(null)} className="text-xs text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* ---- Main panels ---- */}
      <div className="flex flex-1 overflow-hidden">
        <ModelBrowser
          project={storeProject} models={models} diagrams={diagrams}
          selectedDiagramId={selectedDiagramId} onSelectDiagram={selectDiagram}
        />
        <PropertiesPanel element={selectedElement} />
        <main className="relative flex flex-1 overflow-hidden">
          <DiagramEditor diagram={selectedDiagram} />
        </main>
        <Palette diagramType={selectedDiagram?.type ?? null} />
      </div>

      {/* ---- Validation Bar ---- */}
      <ValidationBar />
    </div>
  );
}

export default function EditorPage() {
  return (
    <AuthGuard>
      <EditorContent />
    </AuthGuard>
  );
}
