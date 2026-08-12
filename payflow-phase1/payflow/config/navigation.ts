import type { ComponentType, SVGProps } from "react";
import {
  HomeIcon,
  BoltIcon,
  CreditCardIcon,
  ReceiptIcon,
  ChartIcon,
  SettingsIcon,
  ShieldIcon,
} from "@/components/ui/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Shown in the compact mobile bottom bar. Keep this list to 5 or fewer. */
  showOnMobile?: boolean;
};

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon, showOnMobile: true },
  { label: "Pay a bill", href: "/pay", icon: CreditCardIcon, showOnMobile: true },
  { label: "Bills", href: "/bills", icon: BoltIcon, showOnMobile: true },
  { label: "Transactions", href: "/transactions", icon: ReceiptIcon, showOnMobile: true },
  { label: "Analytics", href: "/analytics", icon: ChartIcon },
];

export const secondaryNav: NavItem[] = [
  { label: "Receipts", href: "/receipts", icon: ReceiptIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon, showOnMobile: true },
  { label: "Admin", href: "/admin", icon: ShieldIcon },
];
