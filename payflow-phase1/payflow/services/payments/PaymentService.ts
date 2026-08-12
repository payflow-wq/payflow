import "server-only";
import type { PaymentProvider } from "./PaymentProvider.interface";
import { MockPaymentProvider } from "./MockPaymentProvider";
import type {
  PaymentRequest,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from "@/types/payment";

/**
 * PaymentService is the ONLY thing the rest of the app (API routes, server
 * actions) should talk to for payments. It resolves which PaymentProvider
 * implementation to use, so routes/components never import a concrete
 * provider directly.
 *
 * No real provider is registered yet — PAYMENT_PROVIDER stays unset until
 * one is integrated. Attempting a real payment before then fails loudly
 * instead of silently pretending to succeed.
 */
class PaymentService {
  private resolveProvider(): PaymentProvider {
    const configured = process.env.PAYMENT_PROVIDER; // e.g. "paystack" once added

    if (!configured) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "No PAYMENT_PROVIDER is configured. Real payments cannot be processed until a provider is integrated."
        );
      }
      // Local/dev fallback only — never used in production.
      return new MockPaymentProvider();
    }

    throw new Error(
      `PAYMENT_PROVIDER="${configured}" is not implemented yet. Add and register a real PaymentProvider before setting this.`
    );
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResult> {
    return this.resolveProvider().initiatePayment(request);
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    return this.resolveProvider().verifyPayment(providerReference);
  }
}

export const paymentService = new PaymentService();
