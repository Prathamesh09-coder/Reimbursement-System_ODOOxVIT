import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell, Check, CheckCheck, Info, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  info: Info,
  approval: ShieldCheck,
  approved: Check,
  rejected: XCircle,
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        {notifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <DropdownMenuItem
              key={n.id}
              className={`flex gap-3 p-3 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
              onClick={() => markAsRead(n.id)}
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                n.type === "approved" ? "text-success" :
                n.type === "rejected" ? "text-destructive" :
                n.type === "approval" ? "text-warning" : "text-primary"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.timestamp}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
