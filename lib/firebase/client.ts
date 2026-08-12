"use client";

/**
 * Firebase client SDK — safe to import from client components only.
 *
 * These NEXT_PUBLIC_ values are bundled into the browser by design; Firebase's
 * web config is not a secret, access is controlled by Firestore/Storage
 * security rules. Never import lib/firebase/admin.ts from here.
 */

import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseConfigIssues(): string[] {
  const required: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ];
  return required.filter(([, value]) => !value).map(([key]) => key);
}

/** True once the minimum Firebase env vars are present. Used to gate UI gracefully in dev. */
export const isFirebaseConfigured = getFirebaseConfigIssues().length === 0;

/**
 * Lazy, defensive init: during local scaffolding (before .env.local is
 * filled in) we still want `npm run dev` and the placeholder pages to run
 * without crashing on a missing/invalid Firebase config. Each getter throws
 * a clear error only when a caller actually tries to use Firebase.
 */
function getApp() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* variables in .env.local (see .env.example)."
    );
  }
  return getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getApp());
}

export function getFirestoreDb() {
  return getFirestore(getApp());
}

export function getFirebaseStorage() {
  return getStorage(getApp());
}
