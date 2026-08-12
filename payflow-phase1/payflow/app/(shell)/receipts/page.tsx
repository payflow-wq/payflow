import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReceiptsPage() {
  return (
    <div>
      <PageHeader title="Receipts" description="Download receipts for any completed payment." />

      <Card>
        <EmptyState
          title="No receipts yet"
          message="Receipts are generated automatically once a payment completes successfully."
        />
      </Card>
    </div>
  );
}
