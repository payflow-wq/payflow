"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  /** Extra visual banner for the development "Mark as Paid" simulation notice. */
  devModeBanner?: string;
}

export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "default",
  devModeBanner,
}: ConfirmActionDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("That didn't work. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      {devModeBanner && (
        <div className="mb-4 rounded border border-amber-100 bg-amber-100/60 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Development mode</p>
          <p className="mt-1 text-sm text-ink">{devModeBanner}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-3 rounded border border-danger-100 bg-danger-100/50 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={handleConfirm} loading={submitting}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
