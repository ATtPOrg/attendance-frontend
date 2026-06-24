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
        className="relative p-2 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
      >
        <Bell size={18} strokeWidth={1.8} color="#6b7280" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-red-500"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-[13px] font-semibold text-gray-900">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={marking}
                  className="flex items-center gap-1 text-[11px] font-medium disabled:opacity-50 text-sp-primary"
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
                <p className="text-[12px] px-4 py-6 text-center text-gray-400">
                  Couldn&apos;t load notifications.
                </p>
              )}
              {!loading && !error && notifications.length === 0 && (
                <p className="text-[12px] px-4 py-8 text-center text-gray-400">
                  You&apos;re all caught up.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 ${n.read ? "bg-white" : "bg-sp-surface"}`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-gray-200" : "bg-sp-primary"}`}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium leading-snug text-gray-900">{n.title}</div>
                    <div className="text-[12px] mt-0.5 leading-snug text-gray-500">{n.body}</div>
                    <div className="text-[11px] mt-1 text-gray-400">{n.time}</div>
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
