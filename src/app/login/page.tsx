"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);

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
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? "خطا در ورود");
    else router.replace("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05050f]">

      {/* ── Gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[90px]" />
      </div>

      {/* ── Subtle grid ── */}
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

        {/* Card glow border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

        <div className="relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Layers className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Noqte</span>
              <span className="ml-2 text-[10px] font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
                MBSE
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1.5">
              خوش برگشتید
            </h1>
            <p className="text-sm text-white/40">
              وارد حساب کاربری خود شوید تا ادامه دهید
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                ایمیل
              </label>
              <div className={`relative rounded-xl border transition-all duration-200 ${
                focused === "email"
                  ? "border-violet-500/60 shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
                  : "border-white/8 hover:border-white/15"
              }`}>
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
              <div className={`relative rounded-xl border transition-all duration-200 ${
                focused === "pass"
                  ? "border-violet-500/60 shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
                  : "border-white/8 hover:border-white/15"
              }`}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                  autoComplete="current-password"
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
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)",
                boxShadow: "0 4px 24px rgba(124,58,237,0.35)",
              }}
            >
              {/* Hover shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)" }} />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  <>
                    ورود به حساب
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

          {/* Sign up link */}
          <p className="text-center text-sm text-white/40">
            حساب ندارید؟{" "}
            <Link href="/register"
              className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              ثبت نام کنید
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

      {/* ── Arcadia layers floating badge ── */}
      <div className="pointer-events-none absolute bottom-8 left-8 hidden lg:flex flex-col gap-2">
        {[
          { code: "OA", color: "#f59e0b" },
          { code: "SA", color: "#3b82f6" },
          { code: "LA", color: "#10b981" },
          { code: "PA", color: "#8b5cf6" },
          { code: "EPBS", color: "#64748b" },
        ].map((v, i) => (
          <div
            key={v.code}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
            style={{
              borderColor: v.color + "30",
              backgroundColor: v.color + "10",
              color: v.color,
              opacity: 0.7 - i * 0.07,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.color }} />
            {v.code}
          </div>
        ))}
      </div>

      {/* ── Feature badge top right ── */}
      <div className="pointer-events-none absolute top-8 right-8 hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/40 backdrop-blur-sm">
        <Sparkles size={12} className="text-violet-400" />
        ابزار مدل‌سازی سیستم Arcadia / Capella
      </div>
    </div>
  );
}
