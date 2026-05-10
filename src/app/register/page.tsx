"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight, Check, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

const PASS_RULES = [
  { label: "۶ کاراکتر", test: (p: string) => p.length >= 6 },
  { label: "حرف بزرگ", test: (p: string) => /[A-Z]/.test(p) },
  { label: "عدد",       test: (p: string) => /[0-9]/.test(p) },
];

function PassStrength({ password }: { password: string }) {
  const passed = PASS_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];
  const labels = ["ضعیف", "متوسط", "قوی"];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? colors[passed - 1] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      {passed > 0 && (
        <p className={`text-[11px] font-medium ${
          passed === 1 ? "text-red-400" : passed === 2 ? "text-amber-400" : "text-emerald-400"
        }`}>
          رمز عبور {labels[passed - 1]}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = register(email, name, password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "خطا در ثبت نام");
    else router.replace("/dashboard");
  };

  const inputClass = (id: string) =>
    `relative rounded-xl border transition-all duration-200 ${
      focused === id
        ? "border-indigo-500/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
        : "border-white/8 hover:border-white/15"
    }`;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05050f] py-8">

      {/* ── Gradient orbs (shifted palette vs login) ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-60 -right-40 w-[650px] h-[650px] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/15 blur-[80px]" />
        <div className="absolute top-1/4 left-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-[90px]" />
      </div>

      {/* ── Grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Card ── */}
      <div className="relative w-full max-w-[420px] mx-4">

        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

        <div className="relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Noqte</span>
              <span className="ml-2 text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
                رایگان
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1.5">
              ایجاد حساب کاربری
            </h1>
            <p className="text-sm text-white/40">
              در چند ثانیه شروع کنید — بدون نیاز به کارت اعتباری
            </p>
          </div>

          {/* Features row */}
          <div className="flex flex-wrap gap-2 mb-7">
            {["پروژه‌های نامحدود", "Traceability خودکار", "Export JSON"].map((f) => (
              <div key={f}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50">
                <Check size={10} className="text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                نام و نام‌خانوادگی
              </label>
              <div className={inputClass("name")}>
                <input
                  type="text"
                  placeholder="علی احمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                ایمیل
              </label>
              <div className={inputClass("email")}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  autoComplete="email"
                  required
                  dir="ltr"
                  className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                رمز عبور
              </label>
              <div className={inputClass("pass")}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full bg-white/5 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && <PassStrength password={password} />}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-1 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #c026d3 100%)",
                boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
              }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #d946ef 100%)" }} />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ثبت نام...
                  </>
                ) : (
                  <>
                    ایجاد حساب رایگان
                    <ArrowRight size={16} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/20">یا</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-white/40">
            حساب دارید؟{" "}
            <Link href="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              وارد شوید
            </Link>
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-xs text-white/20 mt-5">
          <Link href="/" className="hover:text-white/40 transition-colors">
            ← بازگشت به صفحه اصلی
          </Link>
        </p>
      </div>

      {/* ── Floating badges ── */}
      <div className="pointer-events-none absolute bottom-8 right-8 hidden lg:flex flex-col items-end gap-2">
        {[
          { icon: "🔗", text: "RealizationLink خودکار" },
          { icon: "✅", text: "۱۰ قانون Validation" },
          { icon: "⬡",  text: "FunctionalChain Highlight" },
        ].map((b) => (
          <div key={b.text}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white/40 backdrop-blur-sm">
            <span>{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute top-8 left-8 hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/40 backdrop-blur-sm">
        <Sparkles size={12} className="text-indigo-400" />
        Arcadia / Capella MBSE Tooling
      </div>
    </div>
  );
}
