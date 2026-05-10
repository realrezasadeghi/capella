"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight, Check } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

const PASS_RULES = [
  { label: "۶ کاراکتر", test: (p: string) => p.length >= 6 },
  { label: "حرف بزرگ",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "عدد",        test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [name, setName]         = useState("");
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
    const result = register(email, name, password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "خطا در ثبت نام");
    else router.replace("/dashboard");
  };

  const passed = PASS_RULES.filter((r) => r.test(password)).length;
  const barColors = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

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
        <div className="absolute -top-[15rem] -right-[15rem] w-[50rem] h-[50rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-[20rem] -left-[10rem] w-[45rem] h-[45rem] rounded-full bg-violet-600/15 blur-[110px]" />
        <div className="absolute top-1/3 left-1/3 w-[25rem] h-[25rem] rounded-full bg-indigo-900/25 blur-[70px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Noqte</span>
        </Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            رایگان — بدون کارت اعتباری
          </div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.15] text-white">
            همین امروز<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              شروع کنید
            </span>
          </h1>
          <p className="text-base text-white/45 leading-relaxed max-w-sm">
            یک حساب بسازید و اولین مدل Arcadia خود را در چند دقیقه طراحی کنید.
          </p>
        </div>

        <div className="space-y-3">
          {[
            "پروژه‌های نامحدود",
            "Traceability خودکار بین لایه‌ها",
            "Validation بلادرنگ مدل",
            "Export به فرمت JSON",
            "ذخیره‌سازی خودکار",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Check size={11} className="text-indigo-400" />
              </div>
              <span className="text-sm text-white/45">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[400px]">

          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Noqte</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">ایجاد حساب کاربری</h2>
            <p className="text-sm text-white/40">در چند ثانیه شروع کنید</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  نام و نام‌خانوادگی
                </label>
                <div className={fieldClass("name")}>
                  <input type="text" placeholder="علی احمدی"
                    value={name} onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                    required
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none" />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  رمز عبور
                </label>
                <div className={fieldClass("pass")}>
                  <input type={showPass ? "text" : "password"} placeholder="حداقل ۶ کاراکتر"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                    required
                    className="w-full rounded-xl bg-transparent px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="pt-1 space-y-2">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? barColors[passed - 1] : "bg-white/10"}`} />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {PASS_RULES.map((r) => (
                        <span key={r.label}
                          className={`flex items-center gap-1 text-[10px] transition-colors ${r.test(password) ? "text-emerald-400" : "text-white/25"}`}>
                          <span className={`w-1 h-1 rounded-full ${r.test(password) ? "bg-emerald-400" : "bg-white/20"}`} />
                          {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 group mt-1"
                style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 20px rgba(99,102,241,.4)" }}>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#818cf8,#8b5cf6)" }} />
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ثبت نام...</>
                    : <>ایجاد حساب رایگان <ArrowRight size={15} /></>}
                </span>
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-white/35">
            حساب دارید؟{" "}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              وارد شوید
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
