import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Understand where your money goes each month, by category and provider."
      />

      <Card>
        <EmptyState
          title="Not enough data yet"
          message="Spending charts will appear here once you've made a few payments."
        />
      </Card>
    </div>
  );
}
