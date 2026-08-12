"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import { calculateNextDueDate } from "@/lib/utils/date";
import { transactionService } from "@/services/transactions/TransactionService";
import type { Bill, BillFormValues, BillStatus } from "@/types/bill";

/**
 * Bills live at users/{userId}/bills/{billId} — a user-scoped subcollection.
 * This keeps every query implicitly scoped to the signed-in user (no
 * `where("userId", "==", uid)` needed) and avoids composite-index
 * requirements for the simple orderBy queries used here. Ownership is
 * still enforced server-side by Firestore security rules (see
 * firestore.rules) — this scoping is a convenience, not the security
 * boundary.
 */
function billsCollection(userId: string) {
  return collection(getFirestoreDb(), "users", userId, "bills");
}

function billDocRef(userId: string, billId: string) {
  return doc(getFirestoreDb(), "users", userId, "bills", billId);
}

function toIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return null;
}

function fromFirestore(id: string, userId: string, data: DocumentData): Bill {
  return {
    id,
    userId,
    name: data.name,
    category: data.category,
    provider: data.provider ?? null,
    customerReference: data.customerReference ?? null,
    accountReference: data.accountReference ?? null,
    amount: data.amount,
    currency: "NGN",
    frequency: data.frequency,
    dueDate: toIso(data.dueDate) ?? new Date().toISOString(),
    reminderDaysBefore: data.reminderDaysBefore ?? 3,
    status: data.status ?? "active",
    notes: data.notes ?? null,
    isActive: data.status !== "completed",
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) ?? new Date().toISOString(),
    lastPaidAt: toIso(data.lastPaidAt),
    nextDueDate: toIso(data.nextDueDate),
  };
}

class BillService {
  async createBill(userId: string, values: BillFormValues): Promise<string> {
    const docRef = await addDoc(billsCollection(userId), {
      name: values.name,
      category: values.category,
      provider: values.provider || null,
      customerReference: values.customerReference || null,
      accountReference: values.accountReference || null,
      amount: values.amount,
      currency: "NGN",
      frequency: values.frequency,
      dueDate: values.dueDate,
      reminderDaysBefore: values.reminderDaysBefore,
      status: "active" satisfies BillStatus,
      notes: values.notes || null,
      lastPaidAt: null,
      nextDueDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateBill(userId: string, billId: string, values: BillFormValues): Promise<void> {
    await updateDoc(billDocRef(userId, billId), {
      name: values.name,
      category: values.category,
      provider: values.provider || null,
      customerReference: values.customerReference || null,
      accountReference: values.accountReference || null,
      amount: values.amount,
      frequency: values.frequency,
      dueDate: values.dueDate,
      reminderDaysBefore: values.reminderDaysBefore,
      notes: values.notes || null,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteBill(userId: string, billId: string): Promise<void> {
    await deleteDoc(billDocRef(userId, billId));
  }

  async setStatus(userId: string, billId: string, status: BillStatus): Promise<void> {
    await updateDoc(billDocRef(userId, billId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async pauseBill(userId: string, billId: string): Promise<void> {
    await this.setStatus(userId, billId, "paused");
  }

  async resumeBill(userId: string, billId: string): Promise<void> {
    await this.setStatus(userId, billId, "active");
  }

  async getBill(userId: string, billId: string): Promise<Bill | null> {
    const snapshot = await getDoc(billDocRef(userId, billId));
    return snapshot.exists() ? fromFirestore(snapshot.id, userId, snapshot.data()) : null;
  }

  async getBills(userId: string): Promise<Bill[]> {
    const snapshot = await getDocs(billsCollection(userId));
    return snapshot.docs.map((d) => fromFirestore(d.id, userId, d.data()));
  }

  /** Live-updating subscription — bills list and dashboard use this so changes reflect immediately. */
  subscribeToBills(userId: string, onChange: (bills: Bill[]) => void, onError: (error: unknown) => void): Unsubscribe {
    return onSnapshot(
      billsCollection(userId),
      (snapshot) => onChange(snapshot.docs.map((d) => fromFirestore(d.id, userId, d.data()))),
      onError
    );
  }

  /**
   * DEVELOPMENT-ONLY. Records a simulated payment for a bill: creates a
   * transaction with source "manual", marks the bill paid, and advances its
   * next due date. This must be replaced or disabled before any real
   * payment provider is enabled — it does not process real money and must
   * never be represented as a provider-confirmed payment (see Step 9).
   */
  async markBillAsPaidDevelopment(userId: string, bill: Bill): Promise<void> {
    const nextDueDate = calculateNextDueDate(bill.dueDate, bill.frequency);

    await transactionService.createTransaction(userId, {
      billId: bill.id,
      type: "bill_payment",
      category: bill.category,
      provider: bill.provider,
      amount: bill.amount,
      status: "successful",
      source: "manual",
      metadata: { note: "Simulated payment recorded in development mode." },
    });

    await updateDoc(billDocRef(userId, bill.id), {
      lastPaidAt: serverTimestamp(),
      nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
      ...(nextDueDate ? { dueDate: nextDueDate.toISOString() } : {}),
      ...(bill.frequency === "one_time" ? { status: "completed" satisfies BillStatus } : {}),
      updatedAt: serverTimestamp(),
    });
  }
}

export const billService = new BillService();
