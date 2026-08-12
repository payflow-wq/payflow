"use client";

/**
 * Re-exported from components/providers/AuthProvider so existing imports of
 * "@/hooks/useAuth" keep working unchanged. The actual subscription now
 * lives in AuthProvider (mounted once in app/layout.tsx) instead of here,
 * so multiple components sharing this hook no longer each open their own
 * Firebase listener.
 */
export { useAuth, type AuthState } from "@/components/providers/AuthProvider";
