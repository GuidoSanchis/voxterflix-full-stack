import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Award,
  Banknote,
  Clapperboard,
  Globe,
  Heart,
  Languages,
  Layers,
  PenLine,
  Popcorn,
  Star,
  Users,
} from 'lucide-react';
import { useMovieDetails } from '../hooks/useMovies';
import { useToggleFavorite } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';
import { BlurredBackdrop } from '../components/movies/BlurredBackdrop';
import { cn } from '../lib/cn';

function formatVotes(votes?: string): string | null {
  if (!votes) return null;
  const n = Number(votes.replace(/,/g, ''));
  if (Number.isNaN(n)) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M votos`;
  if (n >= 1_000) return `${Math.round(n / 1000)}mil votos`;
  return `${n} votos`;
}

function metacriticColor(score: number) {
  if (score >= 61) return 'bg-green-600';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-600';
}

export function TitleDetailsPage() {
  const { imdbId } = useParams<{ imdbId: string }>();
  const { user } = useAuth();
  const { data: movie, isLoading, isError } = useMovieDetails(imdbId);
  const { isFavorite, toggle } = useToggleFavorite(movie);
  const [imgFailed, setImgFailed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center text-neutral-300">
        <p>Título não encontrado.</p>
        <Link to="/browse" className="text-red-500 hover:underline">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const hasBackdrop = Boolean(movie.Poster) && !imgFailed;

  const votes = formatVotes(movie.imdbVotes);
  const rtRating = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value;
  const metacriticRating = movie.Ratings?.find((r) => r.Source === 'Metacritic')?.Value;
  const metacriticScore = metacriticRating ? Number(metacriticRating.split('/')[0]) : null;

  return (
    <div className="min-h-screen pb-16">
      <div className="relative h-[48vw] max-h-[560px] min-h-[420px] w-full overflow-hidden">
        <BlurredBackdrop
          src={hasBackdrop ? movie.Poster : undefined}
          onError={() => setImgFailed(true)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/10 to-transparent" />

        <Link
          to="/browse"
          className="absolute top-20 left-4 z-10 inline-flex items-center gap-2 text-sm text-neutral-200 transition hover:text-white sm:top-24 sm:left-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-5 px-4 pb-8 sm:gap-8 sm:px-8 sm:pb-12">
          {hasBackdrop && (
            <img
              src={movie.Poster}
              alt={movie.Title}
              onError={() => setImgFailed(true)}
              className="hidden aspect-2/3 w-32 shrink-0 rounded-lg object-cover shadow-2xl ring-1 ring-white/10 sm:block sm:w-40 md:w-48"
            />
          )}

          <div>
            <h1 className="text-3xl font-black drop-shadow-lg sm:text-5xl">{movie.Title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-200">
              {movie.imdbRating && (
                <span className="flex items-center gap-1.5 font-semibold text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  {movie.imdbRating}
                  <span className="text-xs font-normal text-neutral-400">
                    IMDb{votes ? ` · ${votes}` : ''}
                  </span>
                </span>
              )}
              {rtRating && (
                <span className="flex items-center gap-1.5 font-semibold text-red-500">
                  <Popcorn className="h-4 w-4" />
                  {rtRating}
                  <span className="text-xs font-normal text-neutral-400">Rotten Tomatoes</span>
                </span>
              )}
              {metacriticScore !== null && !Number.isNaN(metacriticScore) && (
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white',
                      metacriticColor(metacriticScore),
                    )}
                  >
                    {metacriticScore}
                  </span>
                  <span className="text-xs text-neutral-400">Metacritic</span>
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-200">
              {movie.Year && <span>{movie.Year}</span>}
              {movie.Rated && (
                <span className="rounded border border-neutral-400 px-1.5 py-0.5 text-xs">
                  {movie.Rated}
                </span>
              )}
              {movie.Runtime && <span>{movie.Runtime}</span>}
              {movie.totalSeasons && (
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {movie.totalSeasons}{' '}
                  {movie.totalSeasons === '1' ? 'temporada' : 'temporadas'}
                </span>
              )}
            </div>

            {movie.Genre && (
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.Genre.split(',').map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={toggle}
                className="group mt-6 flex cursor-pointer items-center gap-2 rounded-md bg-neutral-700/70 px-5 py-2 font-semibold text-white transition hover:bg-neutral-700"
              >
                <Heart
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isFavorite
                      ? 'fill-current text-red-600'
                      : 'text-white group-hover:text-red-600',
                  )}
                />
                {isFavorite ? 'Nos Favoritos' : 'Adicionar aos Favoritos'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-8 sm:px-8">
        {movie.Plot && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-white">Sinopse</h2>
            <p className="mt-2 leading-relaxed text-neutral-300">{movie.Plot}</p>
          </div>
        )}

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {movie.Actors && (
            <InfoCard icon={Users} label="Elenco" value={movie.Actors} />
          )}
          {movie.Director && (
            <InfoCard icon={Clapperboard} label="Direção" value={movie.Director} />
          )}
          {movie.Writer && (
            <InfoCard icon={PenLine} label="Roteiro" value={movie.Writer} />
          )}
          {movie.Awards && (
            <InfoCard icon={Award} label="Prêmios" value={movie.Awards} />
          )}
          {movie.BoxOffice && (
            <InfoCard icon={Banknote} label="Bilheteria" value={movie.BoxOffice} />
          )}
          {movie.Language && (
            <InfoCard icon={Languages} label="Idioma" value={movie.Language} />
          )}
          {movie.Country && (
            <InfoCard icon={Globe} label="País" value={movie.Country} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-neutral-900/70 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
      <div>
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
        <p className="mt-1 text-sm text-neutral-200">{value}</p>
      </div>
    </div>
  );
}
