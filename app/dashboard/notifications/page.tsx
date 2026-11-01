"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ArrowLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.ok && data.data) {
        setNotifications(data.data.notifications || []);
      }
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("All notifications marked as read.");
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch {
      toast.error("Could not update notifications.");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-display font-medium text-[var(--text)]">
            Notifications
          </h1>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            Updates on character rentals, reviews, buyout offers, and platform activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] rounded text-xs text-[var(--text)] hover:bg-[var(--panel-raised)]"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[var(--glacier)]" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="vn-panel p-5 animate-pulse h-20 rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="vn-panel p-12 text-center rounded-lg space-y-3">
          <Bell className="w-8 h-8 text-[var(--text-dim)] mx-auto opacity-40" />
          <h3 className="text-sm font-medium text-[var(--text)]">No notifications</h3>
          <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
            You're all caught up. When someone rents a character, leaves a review, or makes an offer, alerts will arrive here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`vn-panel p-4 rounded-lg transition-colors flex items-start justify-between gap-4 border ${
                !n.read
                  ? "border-[var(--glacier)]/40 bg-[var(--panel-raised)]/30"
                  : "border-[var(--line)]"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--glacier)]" />
                  )}
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {n.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    · {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                {n.body && (
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed pl-4">
                    {n.body}
                  </p>
                )}
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="p-1.5 rounded hover:bg-[var(--panel-raised)] text-[var(--glacier)] shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
