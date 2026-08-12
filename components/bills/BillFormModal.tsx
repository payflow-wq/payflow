"use client";

import { useState, type FormEvent } from "react";
import { billFormSchema } from "@/lib/validation";
import { BILL_CATEGORIES, BILL_FREQUENCIES, type Bill, type BillFormValues } from "@/types/bill";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type FieldKey = keyof BillFormValues;
type FieldErrors = Partial<Record<FieldKey, string>>;

interface BillFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BillFormValues) => Promise<void>;
  /** Present when editing an existing bill; absent when creating a new one. */
  bill?: Bill | null;
}

function toDateInputValue(iso: string): string {
  // <input type="date"> needs YYYY-MM-DD in local terms.
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function buildInitialForm(bill?: Bill | null): BillFormValues {
  if (!bill) {
    return {
      name: "",
      category: "other",
      provider: "",
      customerReference: "",
      accountReference: "",
      amount: 0,
      frequency: "monthly",
      dueDate: toDateInputValue(new Date().toISOString()),
      reminderDaysBefore: 3,
      notes: "",
    };
  }
  return {
    name: bill.name,
    category: bill.category,
    provider: bill.provider ?? "",
    customerReference: bill.customerReference ?? "",
    accountReference: bill.accountReference ?? "",
    amount: bill.amount,
    frequency: bill.frequency,
    dueDate: toDateInputValue(bill.dueDate),
    reminderDaysBefore: bill.reminderDaysBefore,
    notes: bill.notes ?? "",
  };
}

const inputClass =
  "h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-danger-600";

export function BillFormModal({ open, onClose, onSubmit, bill }: BillFormModalProps) {
  const [form, setForm] = useState<BillFormValues>(() => buildInitialForm(bill));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset local form state whenever the modal is (re)opened for a different bill.
  const [lastBillId, setLastBillId] = useState<string | null | undefined>(undefined);
  if (open && bill?.id !== lastBillId) {
    setLastBillId(bill?.id ?? null);
    setForm(buildInitialForm(bill));
    setFieldErrors({});
    setFormError(null);
  }

  function update<K extends FieldKey>(key: K, value: BillFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = billFormSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldKey;
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await onSubmit(result.data as BillFormValues);
      onClose();
    } catch {
      setFormError("Couldn't save this bill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bill ? "Edit bill" : "Add a bill"}
      description={bill ? "Update the details for this bill." : "Add a bill so PayFlow can track and remind you about it."}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded border border-danger-100 bg-danger-100/50 px-3 py-2 text-sm text-danger-600">
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="bill-name" className={labelClass}>
            Bill name
          </label>
          <input
            id="bill-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. DStv Compact, Ikeja Electric"
            className={inputClass}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <p className={errorClass}>{fieldErrors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bill-category" className={labelClass}>
              Category
            </label>
            <select
              id="bill-category"
              value={form.category}
              onChange={(e) => update("category", e.target.value as BillFormValues["category"])}
              className={inputClass}
            >
              {BILL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bill-provider" className={labelClass}>
              Provider <span className="text-ink-faint">(optional)</span>
            </label>
            <input
              id="bill-provider"
              value={form.provider}
              onChange={(e) => update("provider", e.target.value)}
              placeholder="e.g. DStv, IKEDC, MTN"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bill-customer-ref" className={labelClass}>
              Customer / smart card number <span className="text-ink-faint">(optional)</span>
            </label>
            <input
              id="bill-customer-ref"
              value={form.customerReference}
              onChange={(e) => update("customerReference", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bill-account-ref" className={labelClass}>
              Meter / account number <span className="text-ink-faint">(optional)</span>
            </label>
            <input
              id="bill-account-ref"
              value={form.accountReference}
              onChange={(e) => update("accountReference", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bill-amount" className={labelClass}>
              Amount (₦)
            </label>
            <input
              id="bill-amount"
              type="number"
              min={0}
              step="0.01"
              value={form.amount || ""}
              onChange={(e) => update("amount", e.target.valueAsNumber || 0)}
              className={inputClass}
              aria-invalid={!!fieldErrors.amount}
            />
            {fieldErrors.amount && <p className={errorClass}>{fieldErrors.amount}</p>}
          </div>
          <div>
            <label htmlFor="bill-frequency" className={labelClass}>
              Frequency
            </label>
            <select
              id="bill-frequency"
              value={form.frequency}
              onChange={(e) => update("frequency", e.target.value as BillFormValues["frequency"])}
              className={inputClass}
            >
              {BILL_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bill-due-date" className={labelClass}>
              Due date
            </label>
            <input
              id="bill-due-date"
              type="date"
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              className={inputClass}
              aria-invalid={!!fieldErrors.dueDate}
            />
            {fieldErrors.dueDate && <p className={errorClass}>{fieldErrors.dueDate}</p>}
          </div>
          <div>
            <label htmlFor="bill-reminder" className={labelClass}>
              Remind me (days before)
            </label>
            <input
              id="bill-reminder"
              type="number"
              min={0}
              max={60}
              value={form.reminderDaysBefore}
              onChange={(e) => update("reminderDaysBefore", e.target.valueAsNumber || 0)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="bill-notes" className={labelClass}>
            Notes <span className="text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="bill-notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="w-full resize-none rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {bill ? "Save changes" : "Add bill"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
