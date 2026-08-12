import type { BillFrequency } from "@/types/bill";

/**
 * Adds `months` calendar months to `date`, clamping to the last valid day
 * of the resulting month when the original day doesn't exist there
 * (e.g. Jan 31 + 1 month -> Feb 28/29, not Mar 3).
 */
function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetMonth = result.getMonth() + months;
  const originalDay = result.getDate();

  result.setDate(1); // avoid month-overflow while switching months
  result.setMonth(targetMonth);

  const daysInTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, daysInTargetMonth));

  return result;
}

/**
 * Given a bill's current due date and its frequency, returns the next
 * expected due date. Returns null for frequencies with no automatic next
 * occurrence (one_time, custom — custom is user-managed for now).
 */
export function calculateNextDueDate(currentDueDate: string | Date, frequency: BillFrequency): Date | null {
  const base = typeof currentDueDate === "string" ? new Date(currentDueDate) : currentDueDate;

  switch (frequency) {
    case "weekly": {
      const next = new Date(base.getTime());
      next.setDate(next.getDate() + 7);
      return next;
    }
    case "monthly":
      return addMonthsClamped(base, 1);
    case "quarterly":
      return addMonthsClamped(base, 3);
    case "yearly":
      return addMonthsClamped(base, 12);
    case "one_time":
    case "custom":
    default:
      return null;
  }
}

export type DueUrgency = "overdue" | "due_today" | "due_this_week" | "upcoming" | "paused" | "completed";

/**
 * Derives a display-only urgency bucket from a bill's due date and
 * lifecycle status. This is never persisted — it's recalculated from
 * `dueDate`/`status` whenever the UI renders, so it's always accurate.
 */
export function getDueUrgency(dueDate: string, status: "active" | "paused" | "completed"): DueUrgency {
  if (status === "paused") return "paused";
  if (status === "completed") return "completed";

  const now = new Date();
  const due = new Date(dueDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due_today";
  if (diffDays <= 7) return "due_this_week";
  return "upcoming";
}

export function isWithinNextDays(dueDate: string, days: number): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

export function isThisCalendarMonth(isoDate: string): boolean {
  const now = new Date();
  const date = new Date(isoDate);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}
