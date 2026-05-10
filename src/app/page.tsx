"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers, ArrowRight, GitMerge, ShieldCheck,
  Network, Zap, GitBranch, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ----------------------------------------------------------------
// Data
// ----------------------------------------------------------------

const ARCADIA_VIEWS = [
  {
    code: "OA",
    label: "Operational Analysis",
    desc: "تحلیل فعالیت‌ها، موجودیت‌ها و تعاملات عملیاتی سیستم",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-700",
  },
  {
    code: "SA",
    label: "System Analysis",
    desc: "تعریف توابع سیستم، FunctionalChain‌ها و رابط‌ها",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
  },
  {
    code: "LA",
    label: "Logical Architecture",
    desc: "تجزیه منطقی به کامپوننت‌های مستقل از تکنولوژی",
    color: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-700",
  },
  {
    code: "PA",
    label: "Physical Architecture",
    desc: "نگاشت روی سخت‌افزار واقعی، مسیرهای ارتباطی فیزیکی",
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    textColor: "text-violet-700",
  },
  {
    code: "EPBS",
    label: "EPBS",
    desc: "ساختار شکست محصول نهایی و پیکربندی آیتم‌ها",
    color: "from-slate-500 to-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    textColor: "text-slate-700",
  },
];

const FEATURES = [
  {
    icon: <GitMerge className="w-5 h-5" />,
    title: "Traceability بلادرنگ",
    desc: "پیوند خودکار عناصر بین لایه‌ها با RealizationLink. هر تغییر فوری قابل ردیابی است.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Validation خودکار",
    desc: "۱۰ قانون اعتبارسنجی Arcadia به‌صورت خودکار در حین مدل‌سازی اجرا می‌شود.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <Network className="w-5 h-5" />,
    title: "دیاگرام تعاملی",
    desc: "Drag & Drop، Zoom، MiniMap و ویرایش inline روی canvas قدرتمند React Flow.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "ذخیره خودکار",
    desc: "تمام تغییرات بلافاصله در localStorage ذخیره می‌شود. هیچ کاری از دست نمی‌رود.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: "FunctionalChain",
    desc: "تعریف و highlight مسیرهای کامل FunctionalChain با رنگ‌بندی متمایز.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "چند پروژه",
    desc: "هر کاربر پروژه‌های جداگانه با مدل‌های مستقل دارد. مدیریت کامل از یک داشبورد.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

export default function LandingPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">

      {/* ---- Navbar ---- */}
      <nav className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900 tracking-tight">Noqte</span>
            <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">Beta</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">ورود</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                شروع رایگان
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white pt-20 pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            ابزار مدل‌سازی سیستم با متدولوژی Arcadia / Capella
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-tight mb-6">
            معماری سیستم،
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              لایه به لایه
            </span>
          </h1>

          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-10">
            از تحلیل عملیاتی تا معماری فیزیکی — همه لایه‌های Arcadia را در یک ابزار
            وب تعاملی طراحی کنید، ردیابی کنید و اعتبارسنجی کنید.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/register">
                شروع رایگان
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/login">ورود به حساب</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Arcadia Views ---- */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              پنج لایه Arcadia
            </h2>
            <p className="text-neutral-500">
              هر لایه دیدگاه متفاوتی از سیستم ارائه می‌دهد
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ARCADIA_VIEWS.map((view, i) => (
              <div key={view.code}
                className={`relative rounded-2xl border ${view.border} ${view.bg} p-5 group hover:shadow-md transition-all duration-200`}
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gradient-to-br shadow-sm text-white flex items-center justify-center text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                >
                  <span className={`w-full h-full rounded-full bg-gradient-to-br ${view.color} flex items-center justify-center`}>
                    {i + 1}
                  </span>
                </div>

                <div className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${view.bg} ${view.textColor} border ${view.border} mb-3`}>
                  {view.code}
                </div>
                <h3 className="font-semibold text-neutral-800 text-sm mb-1.5 leading-tight">
                  {view.label}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {view.desc}
                </p>

                {/* Connector arrow */}
                {i < ARCADIA_VIEWS.length - 1 && (
                  <div className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              ویژگی‌های کلیدی
            </h2>
            <p className="text-neutral-500">
              همه آنچه برای مدل‌سازی حرفه‌ای سیستم نیاز دارید
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="rounded-2xl border border-neutral-100 bg-white p-6 hover:shadow-md hover:border-neutral-200 transition-all duration-200 group"
              >
                <div className={`inline-flex w-10 h-10 rounded-xl ${f.bg} ${f.color} items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-white" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">آماده شروع هستید؟</h2>
          <p className="text-blue-200 mb-8 text-lg">
            همین حالا یک حساب رایگان بسازید و اولین مدل Arcadia خود را طراحی کنید.
          </p>
          <Button size="lg" variant="outline"
            className="text-base px-8 border-white bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-50"
            asChild
          >
            <Link href="/register">
              شروع رایگان
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Layers className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-neutral-700">Noqte</span>
          </div>
          <p className="text-xs text-neutral-400">
            ابزار مدل‌سازی سیستم با متدولوژی Arcadia/Capella
          </p>
        </div>
      </footer>
    </div>
  );
}
