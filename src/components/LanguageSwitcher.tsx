"use client";

import { useLocaleStore, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LangSwitcherProps {
  className?: string;
  variant?: "ghost" | "solid";
}

export function LanguageSwitcher({ className, variant = "ghost" }: LangSwitcherProps) {
  const locale    = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const next: Locale = locale === "fa" ? "en" : "fa";
  const label = locale === "fa" ? "EN" : "FA";

  return (
    <button
      onClick={() => setLocale(next)}
      title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
      className={cn(
        "flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold tracking-wide transition-all duration-200",
        variant === "ghost"
          ? "text-white/50 hover:text-white/80 hover:bg-white/8"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--brand)]",
        className
      )}
    >
      {label}
    </button>
  );
}
