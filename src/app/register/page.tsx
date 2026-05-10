"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight, Check } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useT } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  const router   = useRouter();
  const register = useAuthStore((s) => s.register);
  const user     = useAuthStore((s) => s.currentUser);
  const { t, dir } = useT();

  const [name, setName]         = useState("");
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
    const res = register(email, name, password);
    setLoading(false);
    if (!res.ok) setError(res.error ?? "خطا");
    else router.replace("/dashboard");
  };

  const RULES = [
    { label: t.auth.passRuleLength, test: (p: string) => p.length >= 6 },
    { label: t.auth.passRuleUpper,  test: (p: string) => /[A-Z]/.test(p) },
    { label: t.auth.passRuleNumber, test: (p: string) => /[0-9]/.test(p) },
  ];
  const passed = RULES.filter(r => r.test(password)).length;
  const barColor = ["bg-err-500","bg-warn-500","bg-ok-500"][passed - 1] ?? "";
  const passLabel = [t.auth.passWeak, t.auth.passMed, t.auth.passStrong][passed - 1] ?? "";

  const ring = (id: string) =>
    focused === id
      ? "border-[var(--brand)] shadow-[0_0_0_3px_var(--brand-glow)]"
      : "border-[var(--border)] hover:border-[var(--brand)]/50";

  const FEATURES = dir === "rtl"
    ? ["پروژه‌های نامحدود","Traceability خودکار","Validation بلادرنگ","Export به JSON"]
    : ["Unlimited projects","Automatic traceability","Real-time validation","Export to JSON"];

  return (
    <div dir={dir} className="min-h-screen flex bg-ink-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-56 -right-48 w-[600px] h-[600px] rounded-full bg-brand-600/15 blur-[130px]" />
        <div className="absolute -bottom-40 -left-24  w-[480px] h-[480px] rounded-full bg-brand-800/20 blur-[110px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent-600/8 blur-[90px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage:"linear-gradient(rgba(39,72,226,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(39,72,226,.7) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />

      <div className="hidden lg:flex lg:w-[54%] flex-col justify-between p-14 relative z-10">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-2xl btn-brand flex items-center justify-center">
            <Layers size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">{t.common.appName}</span>
        </Link>
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-ok-500/25 bg-ok-500/10 px-4 py-1.5 text-xs font-medium text-ok-500">
            <span className="w-1.5 h-1.5 rounded-full bg-ok-500" />
            {dir === "rtl" ? "رایگان — بدون کارت اعتباری" : "Free — no credit card required"}
          </div>
          <h1 className="text-[2.8rem] font-extrabold leading-[1.12] text-white">
            {dir === "rtl" ? "همین امروز" : "Start today,"}<br />
            <span className="text-gradient">{dir === "rtl" ? "شروع کنید" : "build confidently"}</span>
          </h1>
          <p className="text-base text-white/40 leading-relaxed max-w-sm">{t.landing.heroDesc}</p>
        </div>
        <div className="space-y-3">
          {FEATURES.map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                <Check size={11} className="text-brand-400" />
              </div>
              <span className="text-sm text-white/45">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-[400px]">
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
            <h2 className="text-2xl font-bold text-white mb-1.5">{t.auth.registerTitle}</h2>
            <p className="text-sm text-white/40">{t.auth.registerSubtitle}</p>
          </div>

          <div className="glass rounded-2xl p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">{t.auth.nameLabel}</label>
                <div className={`relative rounded-xl border transition-all duration-150 bg-white/[0.04] ${ring("name")}`}>
                  <input type="text" placeholder={t.auth.namePlaceholder}
                    value={name} onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} required
                    className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">{t.auth.emailLabel}</label>
                <div className={`relative rounded-xl border transition-all duration-150 bg-white/[0.04] ${ring("email")}`}>
                  <input type="email" dir="ltr" placeholder={t.auth.emailPlaceholder}
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} required autoComplete="email"
                    className="w-full bg-transparent rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">{t.auth.passwordLabel}</label>
                <div className={`relative rounded-xl border transition-all duration-150 bg-white/[0.04] ${ring("pass")}`}>
                  <input type={show ? "text" : "password"} placeholder={t.auth.passwordPlaceholder}
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)} required
                    className="w-full bg-transparent rounded-xl px-4 py-3 pe-11 text-sm text-white placeholder:text-white/25 outline-none" />
                  <button type="button" tabIndex={-1} onClick={() => setShow(!show)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? barColor : "bg-white/10"}`} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {RULES.map(r => (
                          <span key={r.label} className={`flex items-center gap-1 text-[10px] ${r.test(password) ? "text-ok-500" : "text-white/25"}`}>
                            <span className={`w-1 h-1 rounded-full ${r.test(password) ? "bg-ok-500" : "bg-white/20"}`} />
                            {r.label}
                          </span>
                        ))}
                      </div>
                      {passed > 0 && <span className={`text-[10px] font-medium ${["text-err-500","text-warn-500","text-ok-500"][passed-1]}`}>{passLabel}</span>}
                    </div>
                  </div>
                )}
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
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.auth.registering}</>
                  : <>{t.auth.registerBtn} <ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-white/35">
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">{t.auth.doLogin}</Link>
          </p>
          <p className="mt-3 text-center text-xs text-white/20">
            <Link href="/" className="hover:text-white/40 transition-colors">← {t.nav.backToHome}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
