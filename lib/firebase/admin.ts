import "server-only";

/**
 * Firebase Admin SDK — SERVER ONLY.
 *
 * The `server-only` import above makes Next.js throw a build error if this
 * module is ever imported from a client component, as a guardrail against
 * leaking admin credentials into the browser bundle.
 *
 * Uses FIREBASE_ADMIN_* (no NEXT_PUBLIC_ prefix) so these values are never
 * exposed to the browser.
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    // Env vars store literal "\n"; convert back to real newlines.
    privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
  };
}

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (see .env.example)."
    );
  }

  adminApp = getApps().length > 0 ? getApps()[0]! : initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}
