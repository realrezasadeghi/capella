"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useT } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore((s) => s.login);
  const user   = useAuthStore((s) => s.currentUser);
  const { t, dir } = useT();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    const res = login(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error ?? "خطا");
    else router.replace("/dashboard");
  };

  const ring = (id: string) =>
    focused === id ? "border-[var(--brand)] shadow-[0_0_0_3px_var(--brand-glow)]" : "border-[var(--border)] hover:border-[var(--brand)]/50";

  const LAYERS = [
    { code:"OA",   label:"Operational Analysis",  c:"#f59e0b" },
    { code:"SA",   label:"System Analysis",        c:"#2748e2" },
    { code:"LA",   label:"Logical Architecture",   c:"#16a34a" },
    { code:"PA",   label:"Physical Architecture",  c:"#7c3aed" },
    { code:"EPBS", label:"EPBS",                   c:"#64748b" },
  ];

  return (
    <div dir={dir} className="min-h-screen flex bg-ink-950">

      {/* ── Orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-72 -left-48  w-[700px] h-[700px] rounded-full bg-brand-600/15 blur-[140px]" />
        <div className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full bg-brand-800/20 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-600/8 blur-[100px]" />
      </div>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage:"linear-gradient(rgba(39,72,226,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(39,72,226,.7) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[54%] flex-col justify-between p-14 relative z-10">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="w-10 h-10 rounded-2xl btn-brand flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">{t.common.appName}</span>
            <span className="ms-2 text-[10px] font-medium text-accent-400 bg-accent-400/10 border border-accent-400/20 rounded-full px-2 py-0.5">MBSE</span>
          </div>
        </Link>

        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            {t.landing.heroBadge}
          </div>
          <h1 className="text-[2.8rem] font-extrabold leading-[1.12] text-white">
            {t.landing.heroTitle1}<br />
            <span className="text-gradient">{t.landing.heroTitle2}</span>
          </h1>
          <p className="text-base text-white/40 leading-relaxed max-w-sm">{t.landing.heroDesc}</p>
        </div>

        <div className="space-y-2.5">
          {LAYERS.map((v) => (
            <div key={v.code} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border"
                style={{ borderColor: v.c + "35", backgroundColor: v.c + "12", color: v.c }}>
                {v.code}
              </div>
              <span className="text-sm text-white/40">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-xl btn-brand flex items-center justify-center">
                <Layers size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">{t.common.appName}</span>
            </Link>
            <div className="ms-auto flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1.5">{t.auth.loginTitle}</h2>
            <p className="text-sm text-white/40">{t.auth.loginSubtitle}</p>
          </div>

          {/* Glass card */}
          <div className="glass rounded-2xl p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  {t.auth.emailLabel}
                </label>
                <div className={`relative rounded-xl border transition-all duration-150 bg-white/[0.04] ${ring("email")}`}>
                  <input type="email" dir="ltr" placeholder={t.auth.emailPlaceholder}
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    required autoComplete="email"
                    className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  {t.auth.passwordLabel}
                </label>
                <div className={`relative rounded-xl border transition-all duration-150 bg-white/[0.04] ${ring("pass")}`}>
                  <input type={show ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                    required autoComplete="current-password"
                    className="w-full bg-transparent rounded-xl px-4 py-3 pe-11 text-sm text-white placeholder:text-white/25 outline-none" />
                  <button type="button" tabIndex={-1} onClick={() => setShow(!show)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-err-500/25 bg-err-500/10 px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-err-500 shrink-0" />
                  <p className="text-sm text-err-500">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-brand w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.auth.loggingIn}</>
                  : <>{t.auth.loginBtn} <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-white/35">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              {t.auth.doRegister}
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">← {t.nav.backToHome}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
