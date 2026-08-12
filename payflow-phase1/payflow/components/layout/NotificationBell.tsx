"use client";

import { BellIcon } from "@/components/ui/icons";

interface NotificationBellProps {
  unreadCount?: number;
}

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  return (
    <button
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded text-ink-muted hover:bg-background hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
    >
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" aria-hidden />
      )}
    </button>
  );
}
