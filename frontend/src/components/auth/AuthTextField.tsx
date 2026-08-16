import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface AuthTextFieldProps {
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
  /** Mostra o botão de alternar visibilidade da senha (força type="password"/"text"). */
  revealable?: boolean;
}

export function AuthTextField({
  icon: Icon,
  type = 'text',
  placeholder,
  error,
  registration,
  revealable = false,
}: AuthTextFieldProps) {
  const [visible, setVisible] = useState(false);
  const resolvedType = revealable ? (visible ? 'text' : 'password') : type;

  return (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400" />
        <input
          {...registration}
          type={resolvedType}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-white/10 bg-neutral-800/80 py-3 pl-10 text-sm text-white placeholder:text-neutral-400 focus:border-white focus:outline-none',
            revealable ? 'pr-10' : 'pr-4',
          )}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition hover:text-white"
          >
            {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
