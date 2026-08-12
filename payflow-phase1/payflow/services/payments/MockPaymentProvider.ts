import "server-only";
import type { PaymentProvider } from "./PaymentProvider.interface";
import type {
  PaymentRequest,
  PaymentInitiationResult,
  PaymentVerificationResult,
} from "@/types/payment";

/**
 * MOCK PROVIDER — for local UI development only.
 *
 * This does not talk to any real payment network and must never be used to
 * confirm a real payment as successful. It exists so screens like /pay and
 * /transactions have something to render before a real provider is wired
 * up. PaymentService below picks the mock only when explicitly configured
 * to do so (never by default in a production environment).
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock";

  async initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResult> {
    return {
      status: "requires_confirmation",
      providerReference: `mock_${request.reference}`,
    };
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResult> {
    return {
      status: "pending",
      providerReference,
      amount: 0,
      currency: "NGN",
      verifiedAt: new Date().toISOString(),
      rawProviderPayload: { note: "Mock provider — no real payment was made." },
    };
  }

  parseWebhookEvent(): PaymentVerificationResult | null {
    // The mock provider never receives real webhooks.
    return null;
  }
}
