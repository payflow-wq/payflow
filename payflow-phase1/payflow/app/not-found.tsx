import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <p className="font-mono text-sm text-ink-faint">404</p>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/">
        <Button variant="secondary" size="sm" className="mt-2">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
