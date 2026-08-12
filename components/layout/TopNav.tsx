"use client";

import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBell } from "./NotificationBell";
import { MenuIcon } from "@/components/ui/icons";

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/80 sm:px-6">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded text-ink-muted hover:bg-background lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        )}
        <span className="text-sm font-semibold text-ink lg:hidden">PayFlow</span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserProfileMenu />
      </div>
    </header>
  );
}
