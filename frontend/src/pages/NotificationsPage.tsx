import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Info, ShieldCheck, XCircle } from "lucide-react";

const iconMap = {
  info: Info,
  approval: ShieldCheck,
  approved: Check,
  rejected: XCircle,
};

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {notifications.map((n) => {
            const Icon = iconMap[n.type];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/30 ${!n.read ? "bg-primary/5" : ""}`}
                onClick={() => markAsRead(n.id)}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${
                  n.type === "approved" ? "text-success" :
                  n.type === "rejected" ? "text-destructive" :
                  n.type === "approval" ? "text-warning" : "text-primary"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.timestamp}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
