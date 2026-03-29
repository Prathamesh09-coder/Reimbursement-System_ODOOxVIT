import React, { createContext, useContext, useState } from "react";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "approval" | "approved" | "rejected";
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

const INITIAL: Notification[] = [
  { id: "1", message: "New expense submitted by Sarah for $250", type: "info", read: false, timestamp: "2 min ago" },
  { id: "2", message: "Your expense #1042 requires approval", type: "approval", read: false, timestamp: "15 min ago" },
  { id: "3", message: "Expense #1038 has been approved", type: "approved", read: false, timestamp: "1 hour ago" },
  { id: "4", message: "Expense #1035 was rejected by Finance", type: "rejected", read: true, timestamp: "3 hours ago" },
  { id: "5", message: "New user John added to your team", type: "info", read: true, timestamp: "1 day ago" },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
