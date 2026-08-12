"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav, secondaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white">
          P
        </span>
        <span className="text-base font-semibold text-ink">{siteConfig.name}</span>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 px-3 py-2">
        {primaryNav.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={pathname === item.href} />
        ))}
      </nav>

      <div className="border-t border-border px-3 py-2">
        {secondaryNav.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={pathname === item.href} />
        ))}
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: (typeof primaryNav)[number]["icon"];
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-background hover:text-ink"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  );
}
