import { create } from "zustand";
import { persist } from "zustand/middleware";
import fa from "./fa";
import en from "./en";
import type { Translations } from "./fa";

export type Locale = "fa" | "en";

export const translations: Record<Locale, Translations> = { fa, en };

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "fa",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "noqte_locale_v1" }
  )
);

/** Hook — returns translation object + dir + locale */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return {
    t: translations[locale],
    locale,
    dir: translations[locale].dir,
    isRTL: translations[locale].dir === "rtl",
  };
}

/** Time-ago helper (locale-aware) */
export function useTimeAgo() {
  const { t } = useT();
  return (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t.time.justNow;
    if (mins < 60) return t.time.minutesAgo(mins);
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t.time.hoursAgo(hrs);
    return t.time.daysAgo(Math.floor(hrs / 24));
  };
}
