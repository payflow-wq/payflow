"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/lib/validation";
import { authService } from "@/services/auth/AuthService";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { toFriendlyErrorMessage } from "@/lib/utils/errors";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

type FieldKey = "fullName" | "email" | "phoneNumber" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;

const initialForm = { fullName: "", email: "", phoneNumber: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  function update(key: FieldKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldKey;
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (!isFirebaseConfigured) {
      setFormError(
        "Firebase isn't configured yet in this environment. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local to enable sign-up."
      );
      return;
    }

    setSubmitting(true);
    try {
      await authService.register(
        result.data.email,
        result.data.password,
        result.data.fullName,
        result.data.phoneNumber
      );
      router.push("/dashboard");
    } catch (error) {
      setFormError(toFriendlyErrorMessage(error, "Couldn't create your account. That email may already be in use."));
    } finally {
      setSubmitting(false);
    }
  }

  const fields: Array<{ key: FieldKey; label: string; type: string; autoComplete: string }> = [
    { key: "fullName", label: "Full name", type: "text", autoComplete: "name" },
    { key: "email", label: "Email", type: "email", autoComplete: "email" },
    { key: "phoneNumber", label: "Phone number", type: "tel", autoComplete: "tel" },
    { key: "password", label: "Password", type: "password", autoComplete: "new-password" },
    { key: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white">
            P
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">Create your {siteConfig.name} account</h1>
          <p className="mt-1 text-sm text-ink-muted">Takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-card">
          {formError && (
            <p role="alert" className="rounded border border-danger-100 bg-danger-100/50 px-3 py-2 text-sm text-danger-600">
              {formError}
            </p>
          )}

          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-1 block text-sm font-medium text-ink">
                {field.label}
              </label>
              <input
                id={field.key}
                type={field.type}
                autoComplete={field.autoComplete}
                value={form[field.key]}
                onChange={update(field.key)}
                aria-invalid={!!fieldErrors[field.key]}
                aria-describedby={fieldErrors[field.key] ? `${field.key}-error` : undefined}
                className="h-10 w-full rounded border border-border-strong bg-surface px-3 text-sm text-ink outline-none focus-visible:border-brand-500"
              />
              {fieldErrors[field.key] && (
                <p id={`${field.key}-error`} className="mt-1 text-xs text-danger-600">
                  {fieldErrors[field.key]}
                </p>
              )}
            </div>
          ))}

          <Button type="submit" className="w-full" loading={submitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
