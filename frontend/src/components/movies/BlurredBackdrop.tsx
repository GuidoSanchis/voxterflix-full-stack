import { cn } from '../../lib/cn';

interface BlurredBackdropProps {
  src?: string;
  onError?: () => void;
  /** Classe Tailwind de brilho, ex.: 'brightness-[0.55]'. */
  brightness?: string;
  className?: string;
}

// A OMDb só fornece o pôster (retrato) — para preencher um banner largo sem
// esticar/cropar de forma feia, usamos a própria imagem ampliada e borrada
// como fundo (técnica popularizada por apps como o Spotify para capas de
// álbum). Reaproveitado por Banner, TitleDetailsPage e LoginPage.
export function BlurredBackdrop({
  src,
  onError,
  brightness = 'brightness-[0.55]',
  className,
}: BlurredBackdropProps) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={onError}
      className={cn(
        'animate-ken-burns motion-reduce:animate-none absolute inset-0 h-full w-full object-cover object-top blur-3xl saturate-125',
        brightness,
        className,
      )}
    />
  );
}
