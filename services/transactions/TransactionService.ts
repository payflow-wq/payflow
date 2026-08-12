"use client";

import {
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit as fsLimit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { Transaction, TransactionSource, TransactionStatus, TransactionType } from "@/types/transaction";

/**
 * Transactions live at users/{userId}/transactions/{transactionId} — same
 * user-scoped subcollection pattern as bills (see BillService), enforced by
 * firestore.rules server-side.
 */
function transactionsCollection(userId: string) {
  return collection(getFirestoreDb(), "users", userId, "transactions");
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function fromFirestore(id: string, userId: string, data: DocumentData): Transaction {
  return {
    id,
    userId,
    billId: data.billId ?? null,
    type: data.type,
    category: data.category,
    provider: data.provider ?? null,
    amount: data.amount,
    currency: "NGN",
    status: data.status,
    reference: data.reference,
    source: data.source,
    createdAt: toIso(data.createdAt),
    metadata: data.metadata ?? null,
  };
}

function generateReference(): string {
  return `pf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface CreateTransactionInput {
  billId?: string | null;
  type: TransactionType;
  category: string;
  provider?: string | null;
  amount: number;
  status: TransactionStatus;
  source: TransactionSource;
  metadata?: Record<string, string> | null;
}

class TransactionService {
  async createTransaction(userId: string, input: CreateTransactionInput): Promise<string> {
    const docRef = await addDoc(transactionsCollection(userId), {
      billId: input.billId ?? null,
      type: input.type,
      category: input.category,
      provider: input.provider ?? null,
      amount: input.amount,
      currency: "NGN",
      status: input.status,
      reference: generateReference(),
      source: input.source,
      metadata: input.metadata ?? null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getRecentTransactions(userId: string, count = 10): Promise<Transaction[]> {
    const q = query(transactionsCollection(userId), orderBy("createdAt", "desc"), fsLimit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromFirestore(d.id, userId, d.data()));
  }

  /** Live-updating subscription for the most recent N transactions (dashboard's "Recent activity"). */
  subscribeToRecentTransactions(
    userId: string,
    count: number,
    onChange: (transactions: Transaction[]) => void,
    onError: (error: unknown) => void
  ): Unsubscribe {
    const q = query(transactionsCollection(userId), orderBy("createdAt", "desc"), fsLimit(count));
    return onSnapshot(
      q,
      (snapshot) => onChange(snapshot.docs.map((d) => fromFirestore(d.id, userId, d.data()))),
      onError
    );
  }

  async getAllTransactions(userId: string): Promise<Transaction[]> {
    const q = query(transactionsCollection(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => fromFirestore(d.id, userId, d.data()));
  }
}

export const transactionService = new TransactionService();
