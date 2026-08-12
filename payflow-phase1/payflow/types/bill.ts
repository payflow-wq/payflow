export type BillCategory =
  | "airtime"
  | "data"
  | "electricity"
  | "cable"
  | "internet"
  | "subscription"
  | "healthcare"
  | "education"
  | "rent"
  | "insurance"
  | "other";

export const BILL_CATEGORIES: { value: BillCategory; label: string }[] = [
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data" },
  { value: "electricity", label: "Electricity" },
  { value: "cable", label: "Cable TV" },
  { value: "internet", label: "Internet" },
  { value: "subscription", label: "Subscription" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "rent", label: "Rent" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export type BillFrequency = "one_time" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export const BILL_FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

/** Lifecycle status the user controls directly (not the same as due/overdue — see lib/utils/date.ts). */
export type BillStatus = "active" | "paused" | "completed";

export const BILL_STATUSES: { value: BillStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export interface Bill {
  id: string;
  userId: string;
  name: string;
  category: BillCategory;
  provider: string | null;
  customerReference: string | null;
  accountReference: string | null;
  amount: number;
  currency: "NGN";
  frequency: BillFrequency;
  dueDate: string; // ISO 8601
  reminderDaysBefore: number;
  status: BillStatus;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastPaidAt: string | null;
  nextDueDate: string | null;
}

/** Shape accepted from the bill create/edit form, before service-assigned fields are added. */
export interface BillFormValues {
  name: string;
  category: BillCategory;
  provider: string;
  customerReference: string;
  accountReference: string;
  amount: number;
  frequency: BillFrequency;
  dueDate: string;
  reminderDaysBefore: number;
  notes: string;
}
