import "server-only";
import type {
  PaymentRequest,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from "@/types/payment";

/**
 * Every real payment/bill-payment provider (Paystack, Flutterwave, etc.)
 * will eventually implement this interface. Nothing in the rest of the app
 * should depend on a concrete provider — only on this contract — so a
 * provider can be added or swapped without touching UI or route code.
 *
 * No provider is implemented yet. Do not hard-code one. Server-only: this
 * will hold provider SDK calls and secret keys once implemented.
 */
export interface PaymentProvider {
  /** Stable identifier, e.g. "paystack", "flutterwave". Used for logging/audit. */
  readonly id: string;

  /** Starts a payment. May return a redirect URL for hosted checkout flows. */
  initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResult>;

  /**
   * Confirms a payment's true status directly with the provider.
   * A payment must NEVER be marked successful in PayFlow without this
   * (or an equivalent verified webhook) confirming it first.
   */
  verifyPayment(providerReference: string): Promise<PaymentVerificationResult>;

  /**
   * Validates and parses an inbound webhook payload from this provider,
   * verifying its signature against the configured webhook secret.
   * Returns null if the signature is invalid or the payload is malformed.
   */
  parseWebhookEvent(rawBody: string, signatureHeader: string | null): PaymentVerificationResult | null;
}
