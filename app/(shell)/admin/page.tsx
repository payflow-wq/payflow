import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Admin"
        description="Internal tools for managing users, providers, and system health."
      />

      <Card className="flex items-start gap-3">
        <Badge tone="warning">Restricted</Badge>
        <p className="text-sm text-ink-muted">
          This area is reserved for the <code className="font-mono text-xs">admin</code> role. Access
          control and real admin tooling will be added in a later phase.
        </p>
      </Card>
    </div>
  );
}
