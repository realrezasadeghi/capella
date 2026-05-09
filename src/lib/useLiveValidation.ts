"use client";

import { useEffect } from "react";
import { useEditorStore } from "./store";

/**
 * useLiveValidation
 *
 * هر بار که تعداد عناصر یا اتصالات تغییر کند (افزودن / حذف)،
 * اعتبارسنجی مدل را با debounce 700ms اجرا می‌کند.
 * پنل validation را باز نمی‌کند — فقط badge‌های toolbar به‌روز می‌شوند.
 */
export function useLiveValidation() {
  const silentValidate  = useEditorStore((s) => s.silentValidate);
  const elementCount    = useEditorStore((s) => s.elements.length);
  const connectionCount = useEditorStore((s) => s.connections.length);
  // Also re-validate when names or realizationIds change
  const realizationHash = useEditorStore((s) =>
    s.elements.map((e) => `${e.id}:${e.name}:${e.realizationIds.length}`).join("|")
  );

  useEffect(() => {
    const t = setTimeout(() => silentValidate(), 700);
    return () => clearTimeout(t);
  }, [elementCount, connectionCount, realizationHash]); // eslint-disable-line react-hooks/exhaustive-deps
}
