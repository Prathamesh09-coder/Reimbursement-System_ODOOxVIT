import React, { createContext, useContext, useEffect, useState } from "react";
import { api, type BackendUser } from "@/lib/api";

export type UserRole = "admin" | "manager" | "employee" | "finance" | "director";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  companyId: number;
  currency?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { company: string; country: string; name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const AUTH_TOKEN_KEY = "reimburse.auth.token";

const toRole = (role?: string): UserRole => {
  const normalized = (role || "EMPLOYEE").toLowerCase();
  if (["admin", "manager", "employee", "finance", "director"].includes(normalized)) {
    return normalized as UserRole;
  }
  return "employee";
};

const mapUser = (backendUser: BackendUser): AuthUser => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: toRole(backendUser.role),
  company: backendUser.company_name || "Company",
  companyId: backendUser.company_id,
  currency: backendUser.currency || undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.me(savedToken);
        setToken(savedToken);
        setUser(mapUser(profile));
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(mapUser(response.user));
  };

  const signup = async (data: { company: string; country: string; name: string; email: string; password: string }) => {
    const response = await api.signup({
      companyName: data.company,
      country: data.country,
      name: data.name,
      email: data.email,
      password: data.password,
    });

    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(mapUser(response.user));
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user && !!token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
