import { cn } from '../../lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-red-600',
        className,
      )}
      role="status"
      aria-label="Carregando"
    />
  );
}
