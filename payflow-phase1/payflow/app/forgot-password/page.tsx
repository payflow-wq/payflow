"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { resetPasswordSchema } from "@/lib/validation";
import { authService } from "@/services/auth/AuthService";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { toFriendlyErrorMessage } from "@/lib/utils/errors";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }
    setFieldError(null);

    if (!isFirebaseConfigured) {
      setFormError("Firebase isn't configured yet in this environment.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(result.data.email);
      setSent(true);
    } catch (error) {
      // Deliberately generic: don't reveal whether an account exists for this email.
      setFormError(toFriendlyErrorMessage(error, "Couldn't send a reset email right now. Please try again."));
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
          <h1 className="mt-4 text-xl font-semibold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter the email on your {siteConfig.name} account and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-6 text-center">
            <p className="text-sm font-medium text-brand-700">Check your inbox</p>
            <p className="mt-1 text-sm text-ink-muted">
              If an account exists for {email}, a password reset link is on its way.
            </p>
          </div>
        ) : (
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
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? "email-error" : undefined}
                className="h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
              />
              {fieldError && (
                <p id="email-error" className="mt-1 text-xs text-danger-600">
                  {fieldError}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={submitting}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
