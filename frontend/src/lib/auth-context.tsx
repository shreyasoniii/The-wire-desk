"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as api from "./api";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => !!api.getToken());

  useEffect(() => {
    if (!api.getToken()) return;

    api
      .getProfile()
      .then(({ user }) => setUser(user))
      .catch(() => api.clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const { user, token } = await api.loginUser({ email, password });
      api.setToken(token, remember);
      setUser(user);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user, token } = await api.registerUser({ name, email, password });
      api.setToken(token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { user } = await api.getProfile();
    setUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
