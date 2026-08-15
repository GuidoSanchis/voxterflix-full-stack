import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from './useAuth';
import type { Favorite } from '../types/movie';

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
