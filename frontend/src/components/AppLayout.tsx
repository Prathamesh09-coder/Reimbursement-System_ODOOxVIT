import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Receipt, CheckSquare, Users, GitBranch, Bell,
  Menu, X, LogOut, ChevronDown, Wallet
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/contexts/AuthContext";
import NotificationDropdown from "@/components/NotificationDropdown";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager", "employee", "finance", "director"] },
  { to: "/expenses", icon: Receipt, label: "Expenses", roles: ["admin", "manager", "employee", "finance", "director"] },
  { to: "/approvals", icon: CheckSquare, label: "Approvals", roles: ["admin", "manager", "finance", "director"] },
  { to: "/users", icon: Users, label: "Users", roles: ["admin"] },
  { to: "/workflows", icon: GitBranch, label: "Workflows", roles: ["admin"] },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, setRole } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const filteredNav = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Wallet className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-bold text-lg tracking-tight">ReimburseIQ</span>
          <button className="ml-auto lg:hidden text-sidebar-muted" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredNav.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Role switcher for demo */}
        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-muted mb-2 px-1">Demo: Switch role</p>
          <Select value={user?.role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["admin", "manager", "employee", "finance", "director"] as UserRole[]).map((r) => (
                <SelectItem key={r} value={r} className="text-xs capitalize">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {user?.name?.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role} · {user?.company}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
