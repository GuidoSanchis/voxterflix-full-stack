import { useState } from 'react';
import { Link } from 'react-router';
import { Film, X } from 'lucide-react';
import type { MovieSummary } from '../../types/movie';
import { cn } from '../../lib/cn';

interface MovieCardProps {
  movie: MovieSummary;
  className?: string;
  /** Quando informado, mostra um botão de remover no hover (ex.: tela de favoritos). */
  onRemove?: () => void;
}

export function MovieCard({ movie, className, onRemove }: MovieCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasPoster = Boolean(movie.Poster) && !imgFailed;

  function handleRemoveClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onRemove?.();
  }

  return (
    <Link
      to={`/title/${movie.imdbID}`}
      className={cn(
        'group relative block w-40 shrink-0 overflow-hidden rounded-md bg-neutral-900 shadow-lg transition-transform duration-300 ease-out hover:z-10 hover:scale-110 sm:w-48',
        className,
      )}
    >
      <div className="aspect-2/3 w-full">
        {hasPoster ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-800 text-neutral-500">
            <Film className="h-8 w-8" />
            <span className="px-2 text-center text-xs">{movie.Title}</span>
          </div>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          aria-label="Remover dos favoritos"
          onClick={handleRemoveClick}
          className="absolute top-1.5 right-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity duration-200 hover:bg-red-600 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/85 to-transparent p-3 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-sm">{movie.Title}</p>
        <p className="mt-0.5 text-xs font-semibold text-neutral-300">{movie.Year}</p>
      </div>
    </Link>
  );
}
