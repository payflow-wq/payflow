"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatNaira, formatDate } from "@/lib/utils/currency";
import { BILL_CATEGORIES, BILL_FREQUENCIES, type Bill } from "@/types/bill";

interface BillDetailModalProps {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
}

function statusTone(status: Bill["status"]) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "neutral" as const;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

export function BillDetailModal({ open, onClose, bill }: BillDetailModalProps) {
  if (!bill) return null;

  const categoryLabel = BILL_CATEGORIES.find((c) => c.value === bill.category)?.label ?? bill.category;
  const frequencyLabel = BILL_FREQUENCIES.find((f) => f.value === bill.frequency)?.label ?? bill.frequency;

  return (
    <Modal open={open} onClose={onClose} title={bill.name} description={categoryLabel}>
      <div className="mb-4 flex items-center gap-2">
        <Badge tone={statusTone(bill.status)}>{bill.status}</Badge>
        {bill.provider && <Badge tone="neutral">{bill.provider}</Badge>}
      </div>

      <div>
        <Row label="Amount" value={formatNaira(bill.amount)} />
        <Row label="Frequency" value={frequencyLabel} />
        <Row label="Due date" value={formatDate(bill.dueDate)} />
        {bill.customerReference && <Row label="Customer / smart card no." value={bill.customerReference} />}
        {bill.accountReference && <Row label="Meter / account no." value={bill.accountReference} />}
        <Row label="Reminder" value={`${bill.reminderDaysBefore} day(s) before`} />
        {bill.lastPaidAt && <Row label="Last paid" value={formatDate(bill.lastPaidAt)} />}
        {bill.nextDueDate && <Row label="Next due date" value={formatDate(bill.nextDueDate)} />}
      </div>

      {bill.notes && (
        <div className="mt-4">
          <p className="mb-1 text-sm font-medium text-ink">Notes</p>
          <p className="text-sm text-ink-muted">{bill.notes}</p>
        </div>
      )}
    </Modal>
  );
}
