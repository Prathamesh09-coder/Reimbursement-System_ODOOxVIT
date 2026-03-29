import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export interface Notification {
  id: number;
  message: string;
  type: "info" | "approval" | "approved" | "rejected";
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

const toNotificationType = (value?: string | null): Notification["type"] => {
  const normalized = (value || "").toLowerCase();
  if (normalized === "approval") return "approval";
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "info";
};

const toRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const deltaSec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (deltaSec < 60) return `${deltaSec}s ago`;
  const deltaMin = Math.floor(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin}m ago`;
  const deltaHours = Math.floor(deltaMin / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token || !isAuthenticated) {
        setNotifications([]);
        return;
      }

      try {
        const rows = await api.listNotifications(token);
        setNotifications(
          rows.map((row) => ({
            id: row.id,
            message: row.message || "Notification",
            type: toNotificationType(row.type),
            read: row.is_read,
            timestamp: toRelativeTime(row.created_at),
          }))
        );
      } catch {
        setNotifications([]);
      }
    };

    void load();
  }, [token, isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (token) {
      void api.markNotificationRead(token, id);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (token) {
      void api.markAllNotificationsRead(token);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
