export interface MovieSummary {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface MovieRating {
  Source: string;
  Value: string;
}

export interface MovieDetails extends MovieSummary {
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Ratings?: MovieRating[];
  imdbRating?: string;
  imdbVotes?: string;
  totalSeasons?: string;
  BoxOffice?: string;
}

export interface SearchResponse {
  Search: MovieSummary[];
  totalResults: string;
  Response: 'True' | 'False';
}

export interface HomeCategory {
  category: string;
  items: MovieSummary[];
}

export interface HomeResponse {
  banner: MovieDetails | MovieSummary | null;
  categories: HomeCategory[];
}

export interface Favorite {
  id: string;
  imdbId: string;
  title: string;
  poster: string | null;
  year: string | null;
  type: string | null;
  createdAt: string;
}
