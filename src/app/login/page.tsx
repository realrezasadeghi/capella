"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "خطا در ورود");
    else router.replace("/dashboard");
  };

  const fieldClass = (id: string) =>
    `relative rounded-xl transition-all duration-200 border ${
      focused === id
        ? "border-indigo-500/50 shadow-[0_0_0_3px_rgba(99,102,241,0.13)]"
        : "border-white/10 hover:border-white/20"
    }`;

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#08071a]">

      {/* ── Orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20rem] -left-[15rem] w-[55rem] h-[55rem] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute -bottom-[15rem] -right-[10rem] w-[40rem] h-[40rem] rounded-full bg-violet-600/15 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-indigo-900/30 blur-[80px]" />
      </div>

      {/* ── Grid overlay ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Noqte</span>
        </Link>

        {/* Headline */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Arcadia / Capella MBSE Platform
          </div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.15] text-white">
            معماری سیستم،<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              لایه به لایه
            </span>
          </h1>
          <p className="text-base text-white/45 leading-relaxed max-w-sm">
            از تحلیل عملیاتی تا معماری فیزیکی — همه لایه‌های Arcadia را در یک محیط طراحی کنید.
          </p>
        </div>

        {/* Arcadia layers */}
        <div className="space-y-2.5">
          {[
            { code: "OA", label: "Operational Analysis",  clr: "#f59e0b" },
            { code: "SA", label: "System Analysis",       clr: "#6366f1" },
            { code: "LA", label: "Logical Architecture",  clr: "#10b981" },
            { code: "PA", label: "Physical Architecture", clr: "#8b5cf6" },
            { code: "EPBS", label: "EPBS",                clr: "#94a3b8" },
          ].map((v) => (
            <div key={v.code} className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border"
                style={{ borderColor: v.clr + "40", backgroundColor: v.clr + "15", color: v.clr }}>
                {v.code}
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/65 transition-colors">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Noqte</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">خوش برگشتید</h2>
            <p className="text-sm text-white/40">وارد حساب کاربری خود شوید</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  ایمیل
                </label>
                <div className={fieldClass("email")}>
                  <input type="email" placeholder="you@example.com" dir="ltr"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    autoComplete="email" required
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  رمز عبور
                </label>
                <div className={fieldClass("pass")}>
                  <input type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                    autoComplete="current-password" required
                    className="w-full rounded-xl bg-transparent px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 group"
                style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 20px rgba(99,102,241,.4)" }}>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#818cf8,#8b5cf6)" }} />
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ورود...</>
                    : <>ورود به حساب <ArrowRight size={15} /></>}
                </span>
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-white/35">
            حساب ندارید؟{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              ثبت نام کنید
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">← صفحه اصلی</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
