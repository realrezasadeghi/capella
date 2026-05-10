"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return <>{children}</>;
}
