import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';
import type { Favorite, MovieDetails, MovieSummary } from '../types/movie';

const FAVORITES_KEY = ['favorites'];

export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: async () => {
      const response = await api.get<Favorite[]>('/favorites');
      return response.data;
    },
    enabled: Boolean(user),
  });
}

interface AddFavoriteInput {
  imdbId: string;
  title: string;
  poster?: string;
  year?: string;
  type?: string;
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddFavoriteInput) => {
      const response = await api.post<Favorite>('/favorites', input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imdbId: string) => {
      await api.delete(`/favorites/${imdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}

// Concentra o que Banner e TitleDetailsPage precisavam duplicar: saber se um
// título já está favoritado e alternar esse estado. `movie` aceita undefined
// porque em TitleDetailsPage o hook precisa ser chamado antes do early return
// de loading/erro (Rules of Hooks) — nesse caso o toggle simplesmente não faz nada.
export function useToggleFavorite(movie: MovieDetails | MovieSummary | undefined) {
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite =
    Boolean(movie) && (favorites?.some((favorite) => favorite.imdbId === movie?.imdbID) ?? false);

  function toggle() {
    if (!user || !movie) return;
    if (isFavorite) {
      removeFavorite.mutate(movie.imdbID);
    } else {
      addFavorite.mutate({
        imdbId: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster,
        year: movie.Year,
        type: movie.Type,
      });
    }
  }

  return { isFavorite, toggle };
}
