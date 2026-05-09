"use client";

import { useState } from "react";
import {
  ShieldCheck, ShieldAlert, AlertCircle, AlertTriangle,
  Info, ChevronUp, ChevronDown, ArrowRight, X,
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import type { ValidationResult } from "@/domain/entities";

type Filter = "all" | "error" | "warning" | "info";

export default function ValidationBar() {
  const results             = useEditorStore((s) => s.validationResults);
  const visible             = useEditorStore((s) => s.validationVisible);
  const togglePanel         = useEditorStore((s) => s.toggleValidationPanel);
  const navigateTo          = useEditorStore((s) => s.navigateTo);
  const allElements         = useEditorStore((s) => s.elements);
  const diagrams            = useEditorStore((s) => s.diagrams);

  const [filter, setFilter] = useState<Filter>("all");

  const errors   = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const infos    = results.filter((r) => r.severity === "info");

  const filtered =
    filter === "error"   ? errors :
    filter === "warning" ? warnings :
    filter === "info"    ? infos :
    results;

  const isClean  = results.length === 0;
  const hasError = errors.length > 0;

  // ---- Helper: find diagram name for a result ----
  function getDiagramName(r: ValidationResult): string | null {
    const el = r.elementId ? allElements.find((e) => e.id === r.elementId) : null;
    if (!el) return null;
    return diagrams.find((d) => d.id === el.diagramId)?.name ?? null;
  }

  // ---- Severity icon ----
  function SevIcon({ r }: { r: ValidationResult }) {
    if (r.severity === "error")
      return <AlertCircle size={12} className="shrink-0 text-red-500" />;
    if (r.severity === "warning")
      return <AlertTriangle size={12} className="shrink-0 text-amber-500" />;
    return <Info size={12} className="shrink-0 text-blue-500" />;
  }

  const countBadge = (count: number, color: string) =>
    count > 0 ? (
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${color}`}>
        {count}
      </span>
    ) : null;

  const filterBtn = (f: Filter, label: string, count: number) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
        filter === f
          ? "bg-neutral-200 text-neutral-800"
          : "text-neutral-500 hover:bg-neutral-100"
      }`}
    >
      {label}
      {count > 0 && (
        <span className="ml-1 text-neutral-400">({count})</span>
      )}
    </button>
  );

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* ---- Collapsed bar — always visible ---- */}
      <div
        className="flex h-8 cursor-pointer select-none items-center gap-3 px-4 hover:bg-neutral-50"
        onClick={togglePanel}
      >
        {/* Status icon */}
        {isClean ? (
          <ShieldCheck size={14} className="text-green-500" />
        ) : hasError ? (
          <ShieldAlert size={14} className="text-red-500" />
        ) : (
          <ShieldAlert size={14} className="text-amber-500" />
        )}

        <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
          اعتبارسنجی
        </span>

        {/* Count badges */}
        {isClean ? (
          <span className="text-[11px] text-green-600">✓ مدل معتبر است</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {countBadge(errors.length,   "bg-red-100 text-red-700")}
            {countBadge(warnings.length, "bg-amber-100 text-amber-700")}
            {countBadge(infos.length,    "bg-blue-100 text-blue-700")}
          </div>
        )}

        {/* Chevron */}
        <div className="ml-auto text-neutral-400">
          {visible ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </div>
      </div>

      {/* ---- Expanded panel ---- */}
      {visible && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          {/* Filter tabs + close */}
          <div className="flex items-center gap-1 border-b border-neutral-100 px-3 py-1.5 dark:border-neutral-800">
            {filterBtn("all",     `همه`,      results.length)}
            {filterBtn("error",   `خطا`,      errors.length)}
            {filterBtn("warning", `هشدار`,    warnings.length)}
            {filterBtn("info",    `اطلاعات`,  infos.length)}

            <button
              onClick={(e) => { e.stopPropagation(); togglePanel(); }}
              className="ml-auto rounded p-0.5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={12} />
            </button>
          </div>

          {/* Results list */}
          {filtered.length === 0 ? (
            <div className="flex h-12 items-center justify-center text-[11px] text-neutral-300">
              {isClean ? "✓ هیچ مشکلی یافت نشد" : "فیلتر انتخابی نتیجه‌ای ندارد"}
            </div>
          ) : (
            <ul className="max-h-44 overflow-y-auto divide-y divide-neutral-50">
              {filtered.map((r, i) => {
                const diagName = getDiagramName(r);
                const canNavigate = !!r.elementId;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 px-4 py-2 text-[11px] ${
                      canNavigate
                        ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        : ""
                    }`}
                    onClick={() => canNavigate && navigateTo(r.elementId!)}
                  >
                    <SevIcon r={r} />

                    <span className="flex-1 leading-tight text-neutral-600 dark:text-neutral-400">
                      {r.message}
                    </span>

                    {diagName && (
                      <span className="ml-2 shrink-0 text-[10px] text-neutral-400">
                        {diagName}
                      </span>
                    )}

                    {canNavigate && (
                      <ArrowRight size={11} className="shrink-0 text-neutral-300" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
