"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { billService } from "@/services/bills/BillService";
import { toFriendlyErrorMessage, logTechnicalError } from "@/lib/utils/errors";
import { getDueUrgency } from "@/lib/utils/date";
import { BILL_CATEGORIES, BILL_STATUSES, type Bill, type BillFormValues, type BillCategory, type BillStatus } from "@/types/bill";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BillCard } from "@/components/bills/BillCard";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { BillDetailModal } from "@/components/bills/BillDetailModal";
import { ConfirmActionDialog } from "@/components/bills/ConfirmActionDialog";

type SortKey = "dueDate" | "amount";

const urgencyRank: Record<string, number> = {
  overdue: 0,
  due_today: 1,
  due_this_week: 2,
  upcoming: 3,
  paused: 4,
  completed: 5,
};

export default function BillsPage() {
  const { user } = useAuth();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BillCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [pausingBill, setPausingBill] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = billService.subscribeToBills(
      user.uid,
      (data) => {
        setBills(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        logTechnicalError("subscribeToBills", err);
        setError(toFriendlyErrorMessage(err, "We couldn't load your bills. Please try again."));
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const filteredBills = useMemo(() => {
    let result = bills;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) => b.name.toLowerCase().includes(q) || (b.provider ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((b) => b.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sortKey === "amount") return b.amount - a.amount;
      const urgencyDiff = urgencyRank[getDueUrgency(a.dueDate, a.status)] - urgencyRank[getDueUrgency(b.dueDate, b.status)];
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return result;
  }, [bills, search, categoryFilter, statusFilter, sortKey]);

  async function handleCreateOrUpdate(values: BillFormValues) {
    if (!user) return;
    if (editingBill) {
      await billService.updateBill(user.uid, editingBill.id, values);
    } else {
      await billService.createBill(user.uid, values);
    }
  }

  function openCreate() {
    setEditingBill(null);
    setFormOpen(true);
  }

  function openEdit(bill: Bill) {
    setEditingBill(bill);
    setFormOpen(true);
  }

  const hasAnyBills = bills.length > 0;
  const hasFiltersApplied = search.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="My Bills" description="Manage your recurring and upcoming bills in one place." />
        <Button onClick={openCreate} className="shrink-0">
          + Add Bill
        </Button>
      </div>

      {hasAnyBills && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills or providers…"
            aria-label="Search bills"
            className="h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500 sm:max-w-xs"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as BillCategory | "all")}
            aria-label="Filter by category"
            className="h-10 rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
          >
            <option value="all">All categories</option>
            {BILL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BillStatus | "all")}
            aria-label="Filter by status"
            className="h-10 rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
          >
            <option value="all">All statuses</option>
            {BILL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort bills"
            className="h-10 rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500 sm:ml-auto"
          >
            <option value="dueDate">Sort by due date</option>
            <option value="amount">Sort by amount</option>
          </select>
        </div>
      )}

      {loading && <LoadingState label="Loading your bills…" />}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      )}

      {!loading && !error && !hasAnyBills && (
        <EmptyState
          title="You haven't added any bills yet."
          message="Add a recurring or one-off bill and PayFlow will help you track it."
          action={<Button onClick={openCreate}>Add your first bill</Button>}
        />
      )}

      {!loading && !error && hasAnyBills && filteredBills.length === 0 && (
        <EmptyState title="No bills match your filters" message={hasFiltersApplied ? "Try a different search term or clear your filters." : undefined} />
      )}

      {!loading && !error && filteredBills.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onView={() => setViewingBill(bill)}
              onEdit={() => openEdit(bill)}
              onDelete={() => setDeletingBill(bill)}
              onTogglePause={() => setPausingBill(bill)}
              onMarkAsPaid={() => setPayingBill(bill)}
            />
          ))}
        </div>
      )}

      <BillFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        bill={editingBill}
      />

      <BillDetailModal open={!!viewingBill} onClose={() => setViewingBill(null)} bill={viewingBill} />

      {deletingBill && (
        <ConfirmActionDialog
          open={!!deletingBill}
          onClose={() => setDeletingBill(null)}
          onConfirm={async () => {
            if (!user) return;
            await billService.deleteBill(user.uid, deletingBill.id);
          }}
          title="Delete this bill?"
          description={`"${deletingBill.name}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete bill"
          tone="danger"
        />
      )}

      {pausingBill && (
        <ConfirmActionDialog
          open={!!pausingBill}
          onClose={() => setPausingBill(null)}
          onConfirm={async () => {
            if (!user) return;
            if (pausingBill.status === "paused") {
              await billService.resumeBill(user.uid, pausingBill.id);
            } else {
              await billService.pauseBill(user.uid, pausingBill.id);
            }
          }}
          title={pausingBill.status === "paused" ? "Resume this bill?" : "Pause this bill?"}
          description={
            pausingBill.status === "paused"
              ? `"${pausingBill.name}" will start showing reminders again.`
              : `"${pausingBill.name}" won't show reminders while paused.`
          }
          confirmLabel={pausingBill.status === "paused" ? "Resume" : "Pause"}
        />
      )}

      {payingBill && (
        <ConfirmActionDialog
          open={!!payingBill}
          onClose={() => setPayingBill(null)}
          onConfirm={async () => {
            if (!user) return;
            await billService.markBillAsPaidDevelopment(user.uid, payingBill);
          }}
          title="Mark as paid"
          description={`Record "${payingBill.name}" as paid for testing purposes.`}
          confirmLabel="Mark as paid"
          devModeBanner="This does not process a real payment. It only records a simulated transaction for testing."
        />
      )}
    </div>
  );
}
