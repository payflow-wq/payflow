import type { ReactNode } from "react";
import { InboxIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
      <InboxIcon className="h-6 w-6 text-ink-faint" />
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {message && <p className="mt-1 text-sm text-ink-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
