"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { billService } from "@/services/bills/BillService";
import { transactionService } from "@/services/transactions/TransactionService";
import { toFriendlyErrorMessage, logTechnicalError } from "@/lib/utils/errors";
import { formatNaira, formatDate } from "@/lib/utils/currency";
import { isWithinNextDays, isThisCalendarMonth, getDueUrgency } from "@/lib/utils/date";
import type { Bill } from "@/types/bill";
import type { Transaction } from "@/types/transaction";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const RECENT_TRANSACTIONS_LIMIT = 6;

export default function DashboardPage() {
  const { user } = useAuth();

  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billsError, setBillsError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setBillsLoading(true);
    const unsubscribe = billService.subscribeToBills(
      user.uid,
      (data) => {
        setBills(data);
        setBillsLoading(false);
        setBillsError(null);
      },
      (err) => {
        logTechnicalError("dashboard subscribeToBills", err);
        setBillsError(toFriendlyErrorMessage(err, "We couldn't load your bills. Please try again."));
        setBillsLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setTransactionsLoading(true);
    const unsubscribe = transactionService.subscribeToRecentTransactions(
      user.uid,
      RECENT_TRANSACTIONS_LIMIT,
      (data) => {
        setTransactions(data);
        setTransactionsLoading(false);
        setTransactionsError(null);
      },
      (err) => {
        logTechnicalError("dashboard subscribeToRecentTransactions", err);
        setTransactionsError(toFriendlyErrorMessage(err, "We couldn't load recent activity. Please try again."));
        setTransactionsLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const summary = useMemo(() => {
    const activeBills = bills.filter((b) => b.status === "active");

    const totalUpcoming = activeBills.reduce((sum, b) => sum + b.amount, 0);

    const dueThisWeek = activeBills
      .filter((b) => isWithinNextDays(b.dueDate, 7))
      .reduce((sum, b) => sum + b.amount, 0);

    const paidThisMonth = transactions
      .filter((t) => t.status === "successful" && isThisCalendarMonth(t.createdAt))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUpcoming,
      dueThisWeek,
      activeBillsCount: activeBills.length,
      paidThisMonth,
    };
  }, [bills, transactions]);

  const upcomingBills = useMemo(() => {
    return [...bills]
      .filter((b) => b.status === "active")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [bills]);

  const loading = billsLoading || transactionsLoading;

  return (
    <div>
      <PageHeader title="Dashboard" description="An overview of your bills and recent activity." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total upcoming" value={formatNaira(summary.totalUpcoming)} loading={billsLoading} />
        <SummaryCard label="Due this week" value={formatNaira(summary.dueThisWeek)} loading={billsLoading} tone="warning" />
        <SummaryCard label="Active bills" value={String(summary.activeBillsCount)} loading={billsLoading} />
        <SummaryCard label="Paid this month" value={formatNaira(summary.paidThisMonth)} loading={transactionsLoading} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming bills</CardTitle>
          </CardHeader>

          {billsLoading && <LoadingState label="Loading bills…" />}
          {!billsLoading && billsError && <ErrorState message={billsError} />}
          {!billsLoading && !billsError && upcomingBills.length === 0 && (
            <EmptyState
              title="No bills added yet"
              message="Add your first recurring bill so PayFlow can start reminding you before it's due."
              action={
                <Link href="/bills">
                  <Button size="sm">Add a bill</Button>
                </Link>
              }
            />
          )}
          {!billsLoading && !billsError && upcomingBills.length > 0 && (
            <ul className="divide-y divide-border">
              {upcomingBills.map((bill) => {
                const urgency = getDueUrgency(bill.dueDate, bill.status);
                return (
                  <li key={bill.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{bill.name}</p>
                      <p className="text-xs text-ink-muted">Due {formatDate(bill.dueDate)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-sm text-ink">{formatNaira(bill.amount)}</span>
                      {(urgency === "overdue" || urgency === "due_today") && (
                        <Badge tone="danger">{urgency === "overdue" ? "Overdue" : "Due today"}</Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>

          {transactionsLoading && <LoadingState label="Loading activity…" />}
          {!transactionsLoading && transactionsError && <ErrorState message={transactionsError} />}
          {!transactionsLoading && !transactionsError && transactions.length === 0 && (
            <EmptyState title="No activity yet" message="Payments and simulated transactions will show up here." />
          )}
          {!transactionsLoading && !transactionsError && transactions.length > 0 && (
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium capitalize text-ink">{tx.category.replace(/_/g, " ")}</p>
                    <p className="text-xs text-ink-muted">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm text-ink">{formatNaira(tx.amount)}</span>
                    <Badge tone={tx.source === "manual" || tx.source === "simulated" ? "neutral" : "success"}>
                      {tx.source === "manual" || tx.source === "simulated" ? "Simulated" : tx.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!loading && bills.length === 0 && transactions.length === 0 && null /* both empty states above already cover this */}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
  tone = "default",
}: {
  label: string;
  value: string;
  loading: boolean;
  tone?: "default" | "warning" | "success";
}) {
  const valueClass = tone === "warning" ? "text-amber-600" : tone === "success" ? "text-brand-600" : "text-ink";
  return (
    <Card>
      <p className="text-sm text-ink-muted">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-background" aria-hidden />
      ) : (
        <p className={`mt-2 font-mono text-2xl font-semibold ${valueClass}`}>{value}</p>
      )}
    </Card>
  );
}
