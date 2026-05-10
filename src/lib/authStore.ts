import { create } from "zustand";
import { persist } from "zustand/middleware";

// ================================================================
// Types
// ================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string; // ISO string (safe for localStorage)
}

interface StoredUser extends AuthUser {
  passwordHash: string; // simple hash for client-side demo
}

interface AuthState {
  currentUser: AuthUser | null;
  // Actions
  register: (email: string, name: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (name: string) => void;
}

// ================================================================
// Simple hash — demo only, NOT cryptographically secure
// ================================================================
function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

// ================================================================
// Users registry — stored separately in localStorage
// ================================================================
const USERS_KEY = "noqte_users_v1";

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ================================================================
// Store
// ================================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      register: (email, name, password) => {
        const users = getUsers();
        const norm = email.toLowerCase().trim();

        if (!norm || !name.trim() || !password) {
          return { ok: false, error: "همه فیلدها الزامی هستند" };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) {
          return { ok: false, error: "فرمت ایمیل صحیح نیست" };
        }
        if (password.length < 6) {
          return { ok: false, error: "رمز عبور حداقل ۶ کاراکتر باشد" };
        }
        if (users.find((u) => u.email === norm)) {
          return { ok: false, error: "این ایمیل قبلاً ثبت شده است" };
        }

        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          email: norm,
          name: name.trim(),
          passwordHash: simpleHash(password),
          createdAt: new Date().toISOString(),
        };
        saveUsers([...users, newUser]);

        const { passwordHash: _, ...authUser } = newUser;
        set({ currentUser: authUser });
        return { ok: true };
      },

      login: (email, password) => {
        const users = getUsers();
        const norm = email.toLowerCase().trim();
        const user = users.find((u) => u.email === norm);

        if (!user) return { ok: false, error: "حساب کاربری یافت نشد" };
        if (user.passwordHash !== simpleHash(password)) {
          return { ok: false, error: "رمز عبور اشتباه است" };
        }

        const { passwordHash: _, ...authUser } = user;
        set({ currentUser: authUser });
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (name) => {
        const cur = get().currentUser;
        if (!cur) return;
        const users = getUsers();
        const updated = users.map((u) =>
          u.id === cur.id ? { ...u, name: name.trim() } : u
        );
        saveUsers(updated);
        set({ currentUser: { ...cur, name: name.trim() } });
      },
    }),
    {
      name: "noqte_auth_v1",
      partialize: (s) => ({ currentUser: s.currentUser }),
    }
  )
);
