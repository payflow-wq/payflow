"use client";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { UserProfile } from "@/types/user";

function userDocRef(uid: string) {
  return doc(getFirestoreDb(), "users", uid);
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function fromFirestore(uid: string, data: DocumentData): UserProfile {
  return {
    id: uid,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    phoneNumber: data.phoneNumber ?? null,
    photoURL: data.photoURL ?? null,
    role: data.role ?? "user",
    currency: "NGN",
    country: "NG",
    timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    preferences: {
      emailNotifications: data.preferences?.emailNotifications ?? true,
      billReminders: data.preferences?.billReminders ?? true,
      pushNotifications: data.preferences?.pushNotifications ?? false,
    },
  };
}

class UserService {
  /** Creates the Firestore profile document for a newly registered user. Safe to call once, right after sign-up. */
  async createUserProfile(user: User, extra?: { phoneNumber?: string }): Promise<void> {
    await setDoc(userDocRef(user.uid), {
      email: user.email,
      displayName: user.displayName,
      phoneNumber: extra?.phoneNumber ?? user.phoneNumber ?? null,
      photoURL: user.photoURL,
      role: "user",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferences: {
        emailNotifications: true,
        billReminders: true,
        pushNotifications: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /** Creates a profile document only if one doesn't already exist. Used as a safety net on every login. */
  async ensureUserProfile(user: User): Promise<void> {
    const snapshot = await getDoc(userDocRef(user.uid));
    if (!snapshot.exists()) {
      await this.createUserProfile(user);
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await getDoc(userDocRef(uid));
    return snapshot.exists() ? fromFirestore(uid, snapshot.data()) : null;
  }

  async updateUserProfile(
    uid: string,
    updates: Partial<Pick<UserProfile, "displayName" | "phoneNumber" | "preferences">>
  ): Promise<void> {
    await updateDoc(userDocRef(uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}

export const userService = new UserService();
