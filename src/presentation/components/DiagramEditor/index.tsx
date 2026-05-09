"use client";

/**
 * DiagramEditor — Placeholder Component
 *
 * ویرایشگر اصلی دیاگرام مبتنی بر React Flow.
 * این کامپوننت محوری است که:
 *  - Canvas بی‌نهایت برای رسم عناصر Arcadia ارائه می‌دهد
 *  - اتصالات هوشمند را مدیریت می‌کند
 *  - رویدادهای drag-and-drop از Palette را دریافت می‌کند
 *  - ValidationEngine را هنگام ایجاد اتصال فراخوانی می‌کند
 */

import type { Diagram } from "@/domain/entities";

interface DiagramEditorProps {
  diagram: Diagram | null;
}

export default function DiagramEditor({ diagram }: DiagramEditorProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center text-neutral-400">
        <p className="text-lg font-medium">ویرایشگر دیاگرام</p>
        {diagram ? (
          <p className="mt-1 text-sm">
            {diagram.name} — {diagram.type}
          </p>
        ) : (
          <p className="mt-1 text-sm">هیچ دیاگرامی انتخاب نشده</p>
        )}
        <p className="mt-4 text-xs text-neutral-300">
          [React Flow Canvas — در حال توسعه]
        </p>
      </div>
    </div>
  );
}
