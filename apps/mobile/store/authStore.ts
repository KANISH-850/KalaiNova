import { create } from "zustand";
import { api, setAuthToken } from "../services/api";

export interface AuthUser {
  id: number;
  email?: string;
  phone?: string;
  full_name: string;
  role: "artisan" | "buyer" | "admin";
  preferred_language: string;
  artisan_profile?: any;
  buyer_profile?: any;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  language: string;
  setLanguage: (lang: string) => void;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  register: (payload: any) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  language: "ta",
  setLanguage: (lang) => set({ language: lang }),
  login: async (identifier, password) => {
    const res = await api.post("/auth/login", { identifier, password });
    const { access_token, user } = res.data;
    setAuthToken(access_token);
    set({ token: access_token, user, language: user.preferred_language || "en" });
    return user;
  },
  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    const { access_token, user } = res.data;
    setAuthToken(access_token);
    set({ token: access_token, user, language: user.preferred_language || "en" });
    return user;
  },
  logout: () => {
    setAuthToken(null);
    set({ token: null, user: null });
  },
  refreshMe: async () => {
    const res = await api.get("/auth/me");
    set({ user: res.data });
  },
}));
