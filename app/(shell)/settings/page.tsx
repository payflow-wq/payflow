import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const sections = [
  { title: "Profile", body: "Name, email, and phone number." },
  { title: "Notifications", body: "Bill reminders, payment confirmations, weekly summaries." },
  { title: "Family & sharing", body: "Manage family group members and shared bills." },
  { title: "Security", body: "Password, sessions, and account protection." },
] as const;

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <p className="text-sm text-ink-muted">{section.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
