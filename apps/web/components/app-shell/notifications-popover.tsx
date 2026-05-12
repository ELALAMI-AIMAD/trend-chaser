"use client";

import { useCallback, useState } from "react";
import { Bell, CalendarClock, CheckCircle2, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { seedNotifications, type AppNotification } from "@/lib/seed-data";

const TYPE_ICON = {
  "hot-trend": Flame,
  "upload-window": CalendarClock,
  "scan-complete": CheckCircle2,
} as const;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return "just now";
}

export function NotificationsPopover() {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<AppNotification[]>(seedNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClick = useCallback(
    (n: AppNotification) => {
      markRead(n.id);
      if (n.href) router.push(n.href as Parameters<typeof router.push>[0]);
    },
    [markRead, router]
  );

  return (
    <Popover>
      <div style={{ position: "relative", display: "inline-flex" }}>
        <PopoverTrigger className="icon-button" aria-label="Notifications">
          <Bell size={18} />
        </PopoverTrigger>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread`}>
            {unreadCount}
          </span>
        )}
      </div>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        style={
          {
            "--popover": "var(--bg-elevated)",
            width: "340px",
            padding: 0,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: "10px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div className="notif-header">
          <strong>Notifications</strong>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="notif-list">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <button
                key={n.id}
                className={`notif-item${!n.read ? " unread" : ""}`}
                onClick={() => handleClick(n)}
              >
                <div className={`notif-icon notif-icon--${n.type}`}>
                  <Icon size={14} aria-hidden />
                </div>
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
                <div className="notif-right">
                  <span className="notif-time">{relativeTime(n.timestamp)}</span>
                  {!n.read && <span className="notif-unread-dot" aria-hidden />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
