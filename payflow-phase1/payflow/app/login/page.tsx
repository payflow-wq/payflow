"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validation";
import { authService } from "@/services/auth/AuthService";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { toFriendlyErrorMessage } from "@/lib/utils/errors";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (!isFirebaseConfigured) {
      setFormError(
        "Firebase isn't configured yet in this environment. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local to enable login."
      );
      return;
    }

    setSubmitting(true);
    try {
      await authService.login(result.data.email, result.data.password);
      router.push("/dashboard");
    } catch (error) {
      setFormError(toFriendlyErrorMessage(error, "Couldn't sign you in with those details. Check your email and password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white">
            P
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">Log in to {siteConfig.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">Pick up right where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          {formError && (
            <p role="alert" className="rounded border border-danger-100 bg-danger-100/50 px-3 py-2 text-sm text-danger-600">
              {formError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-danger-600">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className="h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
            />
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-xs text-danger-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New to {siteConfig.name}?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
