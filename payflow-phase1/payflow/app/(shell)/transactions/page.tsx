import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TransactionsPage() {
  return (
    <div>
      <PageHeader title="Transactions" description="A history of every payment made through PayFlow." />

      <Card>
        <EmptyState
          title="No transactions yet"
          message="Once you make a payment, it'll appear here with its status and details."
        />
      </Card>
    </div>
  );
}
