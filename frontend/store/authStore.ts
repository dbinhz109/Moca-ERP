"use client";

import { create } from "zustand";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/api";
import type { UserInfo } from "@/types/api";

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isHydrated: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ token, user });
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },
  clear: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
    set({ token: null, user: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    const userRaw = window.localStorage.getItem(AUTH_USER_KEY);
    let user: UserInfo | null = null;
    if (userRaw) {
      try { user = JSON.parse(userRaw) as UserInfo; } catch { user = null; }
    }
    set({ token, user, isHydrated: true });
  },
}));
