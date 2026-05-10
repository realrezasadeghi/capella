"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useLocaleStore } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

function DirSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const dir = translations[locale].dir;
    document.documentElement.dir  = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <DirSync />
      {children}
    </ThemeProvider>
  );
}
