import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useHome } from '../../hooks/useMovies';
import { BlurredBackdrop } from '../movies/BlurredBackdrop';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

// Wrapper compartilhado por LoginPage e RegisterPage — o backdrop usa um
// pôster do catálogo só como plano de fundo decorativo (a tela ainda não
// está autenticada nesse ponto).
export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  const { data: home } = useHome();
  const backdrop = home?.banner?.Poster;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <BlurredBackdrop src={backdrop} brightness="brightness-[0.4]" />
      {!backdrop && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-black to-black" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

      <Link
        to="/"
        className="absolute top-6 left-6 text-2xl font-black tracking-tight text-red-600 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:top-8 sm:left-10"
      >
        VOXTERFLIX
      </Link>

      <div className="relative w-full max-w-sm rounded-lg border border-white/10 bg-black/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <h1 className="mb-1 text-3xl font-bold text-white">{title}</h1>
        <p className="mb-6 text-sm text-neutral-400">{subtitle}</p>
        {children}
        {footer}
      </div>
    </div>
  );
}
