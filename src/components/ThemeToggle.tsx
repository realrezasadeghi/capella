"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "ghost" | "solid";
}

export function ThemeToggle({ className, variant = "ghost" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "روشن" : "تاریک"}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
        variant === "ghost"
          ? "text-white/50 hover:text-white/80 hover:bg-white/8"
          : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text)] hover:border-[var(--brand)]",
        className
      )}
    >
      <Sun  size={15} className={cn("absolute transition-all duration-300", isDark  ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0")} />
      <Moon size={15} className={cn("absolute transition-all duration-300", !isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0")} />
    </button>
  );
}
