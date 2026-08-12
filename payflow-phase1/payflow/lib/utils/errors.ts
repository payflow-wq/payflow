/**
 * Maps technical Firebase/Firestore error codes to short, friendly messages.
 * Always log the original error for debugging; only show the friendly text
 * in the UI.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled. Contact support if that's unexpected.",
  "auth/user-not-found": "We couldn't find an account with those details.",
  "auth/wrong-password": "That password doesn't match this account.",
  "auth/invalid-credential": "Couldn't sign you in with those details. Check your email and password.",
  "auth/email-already-in-use": "That email already has an account. Try logging in instead.",
  "auth/weak-password": "Choose a stronger password (at least 8 characters, with a number).",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "You don't have permission to do that.",
  unavailable: "PayFlow's data service is temporarily unavailable. Please try again shortly.",
  "not-found": "We couldn't find that item — it may have been deleted.",
  cancelled: "That request was cancelled.",
  "deadline-exceeded": "That took too long to complete. Please try again.",
};

interface FirebaseLikeError {
  code?: string;
  message?: string;
}

/** Converts a caught Firebase error into a short, user-safe message. */
export function toFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const err = error as FirebaseLikeError;
  const code = err?.code;

  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (code && FIRESTORE_ERROR_MESSAGES[code]) return FIRESTORE_ERROR_MESSAGES[code];

  return fallback;
}

/** Logs full technical error detail to the console for development/debugging only. */
export function logTechnicalError(context: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error(`[PayFlow] ${context}:`, error);
}
