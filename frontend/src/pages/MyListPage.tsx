import { Heart, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router';
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites';
import { MovieCard } from '../components/movies/MovieCard';
import { Spinner } from '../components/ui/Spinner';

export function MyListPage() {
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 sm:px-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
          <Heart className="h-6 w-6 fill-current text-red-600" />
          Meus Favoritos
        </h1>
        {!isLoading && favorites && favorites.length > 0 && (
          <p className="mt-1 text-sm text-neutral-400">
            {favorites.length} {favorites.length === 1 ? 'título salvo' : 'títulos salvos'}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && favorites?.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Heart className="h-16 w-16 text-neutral-700" />
          <div>
            <p className="text-lg font-semibold text-neutral-200">
              Sua lista de favoritos está vazia
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-400">
              Explore o catálogo e clique no coração dos títulos que quiser assistir depois.
            </p>
          </div>
          <Link
            to="/browse"
            className="mt-2 flex items-center gap-2 rounded-md bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            <LayoutGrid className="h-4 w-4" />
            Explorar catálogo
          </Link>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {favorites.map((favorite) => (
            <MovieCard
              key={favorite.id}
              className="w-full hover:scale-105"
              onRemove={() => removeFavorite.mutate(favorite.imdbId)}
              movie={{
                imdbID: favorite.imdbId,
                Title: favorite.title,
                Poster: favorite.poster ?? undefined,
                Year: favorite.year ?? '',
                Type: favorite.type ?? 'movie',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
