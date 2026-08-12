import { SpinnerIcon } from "./icons";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted"
    >
      <SpinnerIcon className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
