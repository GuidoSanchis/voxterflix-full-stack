import { useSearchParams } from 'react-router';
import { useMovieSearch } from '../hooks/useMovies';
import { MovieCard } from '../components/movies/MovieCard';
import { Spinner } from '../components/ui/Spinner';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { data, isLoading, isError } = useMovieSearch(query);

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 sm:px-8">
      <h1 className="mb-6 text-xl font-semibold text-neutral-100">
        {query ? (
          <>
            Resultados para <span className="text-white">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'Digite algo para buscar'
        )}
      </h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-neutral-400">Nenhum título encontrado para essa busca.</p>
      )}

      {data && data.Search.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.Search.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} className="w-full hover:scale-105" />
          ))}
        </div>
      )}
    </div>
  );
}
