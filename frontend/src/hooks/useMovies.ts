import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { normalizeOmdbNA } from '../lib/normalizeOmdb';
import type { HomeResponse, MovieDetails, SearchResponse } from '../types/movie';

export function useHome() {
  return useQuery({
    queryKey: ['movies', 'home'],
    queryFn: async () => {
      const response = await api.get<HomeResponse>('/movies/home');
      return normalizeOmdbNA(response.data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovieSearch(query: string) {
  return useQuery({
    queryKey: ['movies', 'search', query],
    queryFn: async () => {
      const response = await api.get<SearchResponse>('/movies/search', {
        params: { q: query },
      });
      return normalizeOmdbNA(response.data);
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovieDetails(imdbId: string | undefined) {
  return useQuery({
    queryKey: ['movies', 'details', imdbId],
    queryFn: async () => {
      const response = await api.get<MovieDetails>(`/movies/${imdbId}`);
      return normalizeOmdbNA(response.data);
    },
    enabled: Boolean(imdbId),
    staleTime: 5 * 60 * 1000,
  });
}
