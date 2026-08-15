import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Info } from 'lucide-react';
import type { MovieDetails, MovieSummary } from '../../types/movie';
import { useAddFavorite, useFavorites, useRemoveFavorite } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/cn';

function isMovieDetails(movie: MovieDetails | MovieSummary): movie is MovieDetails {
  return 'Plot' in movie;
}

export function Banner({ movie }: { movie: MovieDetails | MovieSummary }) {
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [imgFailed, setImgFailed] = useState(false);

  const hasBackdrop = movie.Poster && movie.Poster !== 'N/A' && !imgFailed;
  const isFavorite = favorites?.some((favorite) => favorite.imdbId === movie.imdbID) ?? false;
  const plot = isMovieDetails(movie) ? movie.Plot : undefined;

  function handleToggleFavorite() {
    if (!user) return;
    if (isFavorite) {
      removeFavorite.mutate(movie.imdbID);
    } else {
      addFavorite.mutate({
        imdbId: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster !== 'N/A' ? movie.Poster : undefined,
        year: movie.Year,
        type: movie.Type,
      });
    }
  }

  return (
    <div className="relative h-[64vw] max-h-[640px] min-h-[460px] w-full overflow-hidden">
      {hasBackdrop && (
        // A OMDb só fornece o pôster (retrato) — para preencher um banner largo sem
        // esticar/cropar de forma feia, usamos a própria imagem ampliada e borrada
        // como fundo, com o pôster nítido e íntegro sobreposto (técnica popularizada
        // por apps como o Spotify para capas de álbum).
        <img
          src={movie.Poster}
          alt=""
          aria-hidden="true"
          onError={() => setImgFailed(true)}
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover object-top blur-3xl brightness-[0.55] saturate-125"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-5 px-4 pb-10 sm:gap-8 sm:px-8 sm:pb-16">
        {hasBackdrop && (
          <img
            src={movie.Poster}
            alt={movie.Title}
            onError={() => setImgFailed(true)}
            className="hidden aspect-2/3 w-32 shrink-0 rounded-lg object-cover shadow-2xl ring-1 ring-white/10 sm:block sm:w-44 md:w-52"
          />
        )}

        <div className="max-w-xl">
          <h1 className="text-3xl font-black drop-shadow-lg sm:text-5xl">{movie.Title}</h1>
          {plot && (
            <p className="mt-4 line-clamp-3 text-sm text-neutral-200 drop-shadow-sm sm:text-base">
              {plot}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/title/${movie.imdbID}`}
              className="flex items-center gap-2 rounded-md bg-white px-5 py-2 font-semibold text-black transition hover:bg-white/80"
            >
              <Info className="h-5 w-5" />
              Mais informações
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="group flex items-center gap-2 rounded-md bg-neutral-700/70 px-5 py-2 font-semibold text-white transition hover:bg-neutral-700"
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isFavorite
                      ? 'fill-current text-red-600'
                      : 'text-white group-hover:text-red-600',
                  )}
                />
                Favoritos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
