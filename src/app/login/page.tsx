"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);

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
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "خطا در ورود");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-100">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background pattern */}
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
            مدل‌سازی سیستم‌های پیچیده<br />
            با متدولوژی Arcadia
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            طراحی معماری سیستم از لایه عملیاتی تا فیزیکی،
            با ابزاری که تیم‌های MBSE را متحد می‌کند.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative space-y-3">
          {[
            { label: "Operational Analysis (OA)", color: "bg-amber-400/20" },
            { label: "System Architecture (SA)", color: "bg-blue-400/20" },
            { label: "Logical Architecture (LA)", color: "bg-emerald-400/20" },
            { label: "Physical Architecture (PA)", color: "bg-purple-400/20" },
          ].map((item) => (
            <div key={item.label} className={`inline-flex items-center gap-2 rounded-full ${item.color} border border-white/10 px-4 py-2 text-sm text-white/90 mr-2`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900">Noqte</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">خوش برگشتید</h2>
            <p className="text-neutral-500 mt-1 text-sm">
              وارد حساب کاربری خود شوید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ورود...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ورود به حساب
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            حساب کاربری ندارید؟{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              ثبت نام کنید
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
