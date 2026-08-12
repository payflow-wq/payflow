import { z } from "zod";

/**
 * Shared input-validation schemas. Keep validation here rather than inline
 * in components/routes so rules are defined once and reused on both client
 * forms and server route handlers.
 */

export const emailSchema = z.string().trim().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: emailSchema,
    phoneNumber: z
      .string()
      .trim()
      .regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const billFormSchema = z.object({
  name: z.string().trim().min(2, "Give this bill a name.").max(80, "Keep the name under 80 characters."),
  category: z.enum([
    "airtime",
    "data",
    "electricity",
    "cable",
    "internet",
    "subscription",
    "healthcare",
    "education",
    "rent",
    "insurance",
    "other",
  ]),
  provider: z.string().trim().max(80).optional().default(""),
  customerReference: z.string().trim().max(80).optional().default(""),
  accountReference: z.string().trim().max(80).optional().default(""),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  frequency: z.enum(["one_time", "weekly", "monthly", "quarterly", "yearly", "custom"]),
  dueDate: z.string().min(1, "Choose a due date."),
  reminderDaysBefore: z.coerce.number().int().min(0, "Can't be negative.").max(60, "60 days max.").default(3),
  notes: z.string().trim().max(500, "Keep notes under 500 characters.").optional().default(""),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type BillFormInput = z.infer<typeof billFormSchema>;
