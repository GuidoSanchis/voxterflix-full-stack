import { useHome } from '../hooks/useMovies';
import { Banner } from '../components/movies/Banner';
import { MovieRow } from '../components/movies/MovieRow';
import { Spinner } from '../components/ui/Spinner';

export function BrowsePage() {
  const { data, isLoading, isError } = useHome();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-neutral-300">
        Não foi possível carregar o catálogo agora. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="pb-16">
      {data.banner && <Banner movie={data.banner} />}

      <div className="mt-4 space-y-2">
        {data.categories.map((category) => (
          <MovieRow
            key={category.category}
            title={category.category}
            items={category.items}
            ranked={category.category.startsWith('Top 10')}
          />
        ))}
      </div>
    </div>
  );
}
