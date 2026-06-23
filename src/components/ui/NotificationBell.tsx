"use client";
import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import type { NotificationItem } from "@/lib/types";

interface Props {
  fetchNotifications: () => Promise<NotificationItem[]>;
  markAllRead: () => Promise<void>;
}

/**
 * Header bell with unread badge and dropdown feed.
 * Shared by both portals — each passes its own portal-scoped API functions.
 */
export default function NotificationBell({ fetchNotifications, markAllRead }: Props) {
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const { data, loading, error, setData } = useApi(fetchNotifications);

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await markAllRead();
      setData((prev) => (prev ?? []).map((n) => ({ ...n, read: true })));
    } catch {
      // Leave the unread state untouched if the request fails.
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-lg border transition-colors hover:bg-gray-50"
        style={{ borderColor: "#e5e7eb" }}
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
      >
        <Bell size={18} strokeWidth={1.8} color="#6b7280" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#ef4444" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 z-50 w-80 bg-white border rounded-xl shadow-xl overflow-hidden"
            style={{ borderColor: "#e5e7eb", fontFamily: "'Inter',sans-serif" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#f3f4f6" }}>
              <span className="text-[13px] font-semibold" style={{ color: "#111827" }}>Notifications</span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={marking}
                  className="flex items-center gap-1 text-[11px] font-medium disabled:opacity-50"
                  style={{ color: "#570000" }}
                >
                  {marking ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={12} />}
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={18} color="#9ca3af" className="animate-spin" />
                </div>
              )}
              {error && (
                <p className="text-[12px] px-4 py-6 text-center" style={{ color: "#9ca3af" }}>
                  Couldn&apos;t load notifications.
                </p>
              )}
              {!loading && !error && notifications.length === 0 && (
                <p className="text-[12px] px-4 py-8 text-center" style={{ color: "#9ca3af" }}>
                  You&apos;re all caught up.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                  style={{ borderColor: "#f3f4f6", background: n.read ? "white" : "#FFF8F6" }}
                >
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: n.read ? "#e5e7eb" : "#570000" }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium leading-snug" style={{ color: "#111827" }}>{n.title}</div>
                    <div className="text-[12px] mt-0.5 leading-snug" style={{ color: "#6b7280" }}>{n.body}</div>
                    <div className="text-[11px] mt-1" style={{ color: "#9ca3af" }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
