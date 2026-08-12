"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: ReactNode;
}

/**
 * The authenticated application shell: sidebar (desktop), top nav, main
 * content area, and bottom nav (mobile). Route pages under /dashboard,
 * /pay, /bills, etc. render inside this via app/(shell paths)/layout.tsx.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 lg:pb-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
