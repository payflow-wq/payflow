"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * Wraps the authenticated (shell) route group. Unauthenticated users are
 * redirected to /login; the protected content never renders for them.
 *
 * If Firebase itself isn't configured (no .env.local yet), we deliberately
 * do NOT redirect — that would create a loop, since /login can't
 * authenticate anyone either. Instead we show a setup notice so local
 * development still works before Firebase is wired up.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, configError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !configError && !user) {
      router.replace("/login");
    }
  }, [loading, configError, user, router]);

  if (loading) {
    return <LoadingState label="Checking your session…" />;
  }

  if (configError) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm font-semibold text-ink">Firebase isn't configured yet</p>
        <p className="mt-1 text-sm text-ink-muted">
          Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local (see .env.example) to enable
          accounts and load real data.
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect is in flight (see effect above); render nothing meanwhile.
    return null;
  }

  return <>{children}</>;
}
