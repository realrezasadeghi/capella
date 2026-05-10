"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, GitMerge, ShieldCheck, Network, Zap, GitBranch, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useT } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const user = useAuthStore((s) => s.currentUser);
  const router = useRouter();
  const { t, dir } = useT();

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const VIEWS = [
    { code:"OA",   label:"Operational Analysis",  desc: dir==="rtl" ? "تحلیل فعالیت‌ها و موجودیت‌های عملیاتی" : "Operational activities and entities",  c:"#f59e0b" },
    { code:"SA",   label:"System Analysis",        desc: dir==="rtl" ? "توابع سیستم و FunctionalChain‌ها"      : "System functions and functional chains", c:"#2748e2" },
    { code:"LA",   label:"Logical Architecture",   desc: dir==="rtl" ? "کامپوننت‌های منطقی مستقل از تکنولوژی" : "Technology-independent logical components",c:"#16a34a" },
    { code:"PA",   label:"Physical Architecture",  desc: dir==="rtl" ? "نگاشت روی سخت‌افزار واقعی"            : "Mapping to real hardware",               c:"#7c3aed" },
    { code:"EPBS", label:"EPBS",                   desc: dir==="rtl" ? "ساختار شکست محصول نهایی"               : "End product breakdown structure",         c:"#64748b" },
  ];

  const CAPS = [
    { icon:<GitMerge size={20}/>,  title: dir==="rtl"?"Traceability بلادرنگ":"Real-time Traceability",   desc: dir==="rtl"?"پیوند خودکار عناصر بین لایه‌ها با RealizationLink":"Automatic cross-layer element linking via RealizationLink", c:"text-brand-600 dark:text-brand-400", bg:"bg-brand-50 dark:bg-brand-950/50" },
    { icon:<ShieldCheck size={20}/>,title:dir==="rtl"?"Validation خودکار":"Auto Validation",              desc: dir==="rtl"?"۱۰ قانون اعتبارسنجی Arcadia در حین مدل‌سازی":"10 Arcadia validation rules run during modeling",           c:"text-ok-600 dark:text-ok-500",     bg:"bg-ok-50 dark:bg-ok-950/30" },
    { icon:<Network size={20}/>,    title:dir==="rtl"?"Canvas تعاملی":"Interactive Canvas",               desc: dir==="rtl"?"Drag & Drop، Zoom، MiniMap روی React Flow":"Drag & Drop, Zoom, MiniMap on React Flow canvas",           c:"text-accent-600 dark:text-accent-500",bg:"bg-accent-50 dark:bg-accent-950/30" },
    { icon:<Zap size={20}/>,        title:dir==="rtl"?"ذخیره خودکار":"Auto-save",                        desc: dir==="rtl"?"تمام تغییرات بلافاصله ذخیره می‌شود":"All changes saved instantly to localStorage",               c:"text-brand-600 dark:text-brand-400", bg:"bg-brand-50 dark:bg-brand-950/50" },
    { icon:<GitBranch size={20}/>,  title:"FunctionalChain",                                              desc: dir==="rtl"?"Highlight مسیرهای کامل FunctionalChain":"Highlight complete functional chain paths",                c:"text-ok-600 dark:text-ok-500",     bg:"bg-ok-50 dark:bg-ok-950/30" },
    { icon:<Layers size={20}/>,     title:dir==="rtl"?"چند پروژه":"Multi-project",                       desc: dir==="rtl"?"پروژه‌های جداگانه با مدل‌های مستقل":"Separate projects with independent models",                   c:"text-accent-600 dark:text-accent-500",bg:"bg-accent-50 dark:bg-accent-950/30" },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-[var(--header-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl btn-brand flex items-center justify-center shadow-sm">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">{t.common.appName}</span>
            <span className="text-[10px] font-medium text-accent-400 bg-accent-400/15 border border-accent-400/25 rounded-full px-2 py-0.5 hidden sm:inline">MBSE</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white/90 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/8">
              {t.auth.login}
            </Link>
            <Link href="/register" className="btn-brand text-sm font-semibold rounded-xl px-4 py-1.5 flex items-center gap-1.5">
              {t.landing.startFree} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero (dark) ── */}
      <section className="relative overflow-hidden bg-ink-950 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40  w-[600px] h-[600px] rounded-full bg-brand-600/15 blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-brand-800/20 blur-[90px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-600/6 blur-[80px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:"linear-gradient(rgba(39,72,226,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(39,72,226,.7) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            {t.landing.heroBadge}
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white mb-6">
            {t.landing.heroTitle1}<br />
            <span className="text-gradient">{t.landing.heroTitle2}</span>
          </h1>
          <p className="text-lg text-white/45 leading-relaxed max-w-2xl mx-auto mb-10">
            {t.landing.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-brand text-base font-semibold rounded-2xl px-8 py-3.5 flex items-center justify-center gap-2">
              {t.landing.startFree} <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="text-base font-medium rounded-2xl px-8 py-3.5 border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all flex items-center justify-center">
              {t.landing.signIn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Arcadia Views ── */}
      <section className="py-20 bg-[var(--surface-2)] dark:bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-3">{t.landing.featuresTitle}</h2>
            <p className="text-[var(--text-3)]">{t.landing.featuresDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {VIEWS.map((v, i) => (
              <div key={v.code} className="relative card p-5 group hover:shadow-md transition-all duration-200">
                <div className="absolute -top-3 -start-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: v.c }}>
                  {i+1}
                </div>
                <div className="inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold mb-3 border"
                  style={{ borderColor: v.c+"30", backgroundColor: v.c+"12", color: v.c }}>
                  {v.code}
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-1.5 leading-tight">{v.label}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
                {i < VIEWS.length-1 && (
                  <div className="hidden lg:block absolute -end-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-[var(--border)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-3">{t.landing.capabilitiesTitle}</h2>
            <p className="text-[var(--text-3)]">{t.landing.capabilitiesDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPS.map(c => (
              <div key={c.title} className="card p-6 hover:shadow-md hover:border-[var(--brand)] transition-all duration-200">
                <div className={`inline-flex w-11 h-11 rounded-xl ${c.bg} ${c.c} items-center justify-center mb-4`}>
                  {c.icon}
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2">{c.title}</h3>
                <p className="text-sm text-[var(--text-3)] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-ink-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-600/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-600/10 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t.landing.ctaTitle}</h2>
          <p className="text-white/45 mb-8 text-lg">{t.landing.ctaDesc}</p>
          <Link href="/register" className="btn-brand text-base font-semibold rounded-2xl px-8 py-3.5 inline-flex items-center gap-2">
            {t.landing.startFree} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--header-border)] bg-[var(--header-bg)] py-6">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg btn-brand flex items-center justify-center">
              <Layers size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white/70">{t.common.appName}</span>
          </div>
          <p className="text-xs text-white/25">{t.common.tagline}</p>
        </div>
      </footer>
    </div>
  );
}
