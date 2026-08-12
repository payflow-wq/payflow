"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatNaira, formatDate } from "@/lib/utils/currency";
import { getDueUrgency } from "@/lib/utils/date";
import { BILL_CATEGORIES } from "@/types/bill";
import type { Bill } from "@/types/bill";

interface BillCardProps {
  bill: Bill;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePause: () => void;
  onMarkAsPaid: () => void;
}

const urgencyTone = {
  overdue: "danger",
  due_today: "danger",
  due_this_week: "warning",
  upcoming: "neutral",
  paused: "neutral",
  completed: "success",
} as const;

const urgencyLabel: Record<string, string> = {
  overdue: "Overdue",
  due_today: "Due today",
  due_this_week: "Due this week",
  upcoming: "Upcoming",
  paused: "Paused",
  completed: "Completed",
};

export function BillCard({ bill, onView, onEdit, onDelete, onTogglePause, onMarkAsPaid }: BillCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const urgency = getDueUrgency(bill.dueDate, bill.status);
  const categoryLabel = BILL_CATEGORIES.find((c) => c.value === bill.category)?.label ?? bill.category;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button type="button" onClick={onView} className="truncate text-left text-sm font-semibold text-ink hover:underline">
            {bill.name}
          </button>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {categoryLabel}
            {bill.provider ? ` · ${bill.provider}` : ""}
          </p>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${bill.name}`}
            className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-background hover:text-ink"
          >
            <span aria-hidden className="text-lg leading-none">
              ⋯
            </span>
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full z-10 mt-1 w-40 rounded border border-border bg-surface py-1 shadow-card">
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onView();
                }}
              >
                View
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              >
                Edit
              </MenuItem>
              {bill.status !== "completed" && (
                <MenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    onTogglePause();
                  }}
                >
                  {bill.status === "paused" ? "Resume" : "Pause"}
                </MenuItem>
              )}
              {bill.status !== "completed" && (
                <MenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    onMarkAsPaid();
                  }}
                >
                  Mark as paid
                </MenuItem>
              )}
              <MenuItem
                tone="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-lg font-semibold text-ink">{formatNaira(bill.amount)}</p>
          <p className="text-xs text-ink-muted">Due {formatDate(bill.dueDate)}</p>
        </div>
        <Badge tone={urgencyTone[urgency]}>{urgencyLabel[urgency]}</Badge>
      </div>
    </Card>
  );
}

function MenuItem({
  children,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={`block w-full px-3 py-2 text-left text-sm hover:bg-background ${
        tone === "danger" ? "text-danger-600" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}
