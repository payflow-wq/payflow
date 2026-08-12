export type TransactionType = "bill_payment" | "airtime" | "data" | "other";

export type TransactionStatus = "pending" | "processing" | "successful" | "failed" | "refunded";

/**
 * "manual" / "simulated" are DEVELOPMENT-ONLY sources, created by the
 * "Mark as Paid" flow (see services/bills/BillService.ts). A transaction
 * must never be created with any other source unless a real PaymentProvider
 * (services/payments/) has actually confirmed it — see Step 9 safety rule.
 */
export type TransactionSource = "manual" | "simulated" | "provider";

export interface Transaction {
  id: string;
  userId: string;
  billId: string | null;
  type: TransactionType;
  category: string;
  provider: string | null;
  amount: number;
  currency: "NGN";
  status: TransactionStatus;
  reference: string;
  source: TransactionSource;
  createdAt: string;
  metadata: Record<string, string> | null;
}
