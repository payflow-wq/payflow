import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const categories = [
  { name: "Airtime", blurb: "Top up any network instantly." },
  { name: "Data", blurb: "Buy a data bundle for any network." },
  { name: "Electricity", blurb: "Pay your DisCo prepaid or postpaid bill." },
  { name: "Cable TV", blurb: "DStv, GOtv, and Startimes subscriptions." },
  { name: "Internet", blurb: "Pay your home or office internet bill." },
  { name: "Subscriptions", blurb: "Track and pay recurring subscriptions." },
] as const;

export default function PayPage() {
  return (
    <div>
      <PageHeader
        title="Pay a bill"
        description="Choose what you'd like to pay. Payment processing isn't connected yet — a real provider will be integrated in a later phase."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{category.name}</h3>
              <Badge tone="neutral">Coming soon</Badge>
            </div>
            <p className="text-sm text-ink-muted">{category.blurb}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
