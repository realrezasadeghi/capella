"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight, Check } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASS_RULES = [
  { label: "حداقل ۶ کاراکتر", test: (p: string) => p.length >= 6 },
  { label: "حرف بزرگ انگلیسی", test: (p: string) => /[A-Z]/.test(p) },
  { label: "عدد", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = register(email, name, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "خطا در ثبت نام");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neutral-50 via-indigo-50/20 to-neutral-100">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border border-white/40" />
          <div className="absolute top-40 left-40 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-white/30" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Noqte</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            همین امروز شروع کنید
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            یک حساب رایگان بسازید و اولین مدل Arcadia خود را در چند دقیقه طراحی کنید.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            "ایجاد پروژه‌های نامحدود",
            "Traceability خودکار بین لایه‌ها",
            "Validation بلادرنگ مدل",
            "Export به فرمت JSON",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/90 text-sm">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900">Noqte</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">ایجاد حساب کاربری</h2>
            <p className="text-neutral-500 mt-1 text-sm">
              رایگان — بدون نیاز به کارت اعتباری
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">نام و نام‌خانوادگی</Label>
              <Input
                id="name"
                type="text"
                placeholder="علی احمدی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-10"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {PASS_RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-1 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.test(password) ? "bg-emerald-500" : "bg-neutral-300"}`} />
                      <span className={rule.test(password) ? "text-emerald-600" : "text-neutral-400"}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ثبت نام...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ایجاد حساب
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            حساب دارید؟{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              وارد شوید
            </Link>
          </p>

          <p className="text-center text-xs text-neutral-400 mt-8">
            بازگشت به{" "}
            <Link href="/" className="hover:text-neutral-600 transition-colors underline underline-offset-2">
              صفحه اصلی
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
