/**
 * Provider-agnostic payment types.
 *
 * No concrete Nigerian payment/bill-payment provider is wired up yet.
 * These types describe the shape every future provider adapter must
 * conform to (see services/payments/PaymentProvider.interface.ts).
 */

export interface PaymentRequest {
  amount: number;
  currency: "NGN";
  reference: string; // PayFlow-generated idempotency key
  description: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export type PaymentInitiationStatus = "requires_redirect" | "requires_confirmation" | "failed";

export interface PaymentInitiationResult {
  status: PaymentInitiationStatus;
  providerReference: string | null;
  redirectUrl?: string;
  failureReason?: string;
}

export type PaymentVerificationStatus = "successful" | "pending" | "failed";

export interface PaymentVerificationResult {
  status: PaymentVerificationStatus;
  providerReference: string;
  amount: number;
  currency: "NGN";
  verifiedAt: string;
  rawProviderPayload?: unknown;
}
