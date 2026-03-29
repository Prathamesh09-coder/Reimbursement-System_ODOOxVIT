import React, { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "manager" | "employee" | "finance" | "director";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (data: { company: string; country: string; name: string; email: string; password: string }) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const DEMO_USER: AuthUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@acmecorp.com",
  role: "admin",
  company: "Acme Corp",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (_email: string, _password: string) => {
    setUser(DEMO_USER);
  };

  const signup = (data: { company: string; country: string; name: string; email: string; password: string }) => {
    setUser({ ...DEMO_USER, name: data.name, email: data.email, company: data.company });
  };

  const logout = () => setUser(null);

  const setRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
