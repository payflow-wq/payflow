"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { userService } from "@/services/user/UserService";

export interface AuthState {
  user: User | null;
  loading: boolean;
  /** True if Firebase env vars are missing — surfaced so UI can show a setup notice instead of hanging or redirect-looping. */
  configError: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, configError: false });

/**
 * Subscribes to Firebase auth state ONCE at the app root and shares it via
 * context, rather than every consumer (nav, profile menu, protected routes)
 * opening its own onAuthStateChanged listener.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    configError: !isFirebaseConfigured,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setState({ user: null, loading: false, configError: true });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        setState({ user, loading: false, configError: false });
        // Best-effort: make sure a Firestore profile exists for this user
        // (covers accounts created before this phase, or edge cases where
        // registration's profile write didn't complete). Never blocks render.
        if (user) {
          void userService.ensureUserProfile(user).catch(() => {
            /* non-fatal — profile will be retried on next auth state change */
          });
        }
      },
      () => setState({ user: null, loading: false, configError: true })
    );

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

/** Reads the current Firebase auth state. Same shape as before — existing call sites are unaffected. */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}
