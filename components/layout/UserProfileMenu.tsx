"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth/AuthService";
import { ChevronDownIcon } from "@/components/ui/icons";

export function UserProfileMenu() {
  const { user, configError } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.displayName || user?.email || (configError ? "Guest" : "Account");
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    setOpen(false);
    if (configError) return;
    await authService.logout();
    router.push("/login");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {initial}
        </span>
        <span className="hidden max-w-[9rem] truncate font-medium text-ink sm:inline">{displayName}</span>
        <ChevronDownIcon className="hidden h-4 w-4 text-ink-muted sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded border border-border bg-surface py-1 shadow-card"
        >
          <a
            role="menuitem"
            href="/settings"
            className="block px-3 py-2 text-sm text-ink hover:bg-background"
          >
            Settings
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-left text-sm text-danger-600 hover:bg-background"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
