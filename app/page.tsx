import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

const highlights = [
  { title: "Airtime & data", body: "Top up any Nigerian network in a few taps." },
  { title: "Electricity & cable", body: "Pay PHCN/DisCo and DStv, GOtv or Startimes bills." },
  { title: "Never miss a due date", body: "PayFlow reminds you before a bill is overdue." },
  { title: "One place for receipts", body: "Every payment, tracked and downloadable." },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white">
            P
          </span>
          <span className="text-base font-semibold text-ink">{siteConfig.name}</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Create account</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
          Built for Nigerian households
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {siteConfig.tagline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-muted">{siteConfig.description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              I already have an account
            </Button>
          </Link>
        </div>

        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-surface p-4">
              <dt className="text-sm font-semibold text-ink">{item.title}</dt>
              <dd className="mt-1 text-sm text-ink-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-ink-faint sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. Payments are not yet processed — provider
        integration is in progress.
      </footer>
    </div>
  );
}
