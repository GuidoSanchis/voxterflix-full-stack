import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

interface HomeCategoryConfig {
  label: string;
  term: string;
  // Filtra pelo campo "Type" que a OMDb retorna (movie/series/episode) —
  // usado para separar os rankings de Top 10 por tipo de título.
  type?: 'movie' | 'series';
}

// A OMDb não expõe um endpoint de "categorias"/"em alta": os carrosséis da
// home são montados fazendo uma busca por termo fixo para cada categoria.
// "man" é o termo mais genérico que retorna um volume bom pros dois tipos
// (~14 mil filmes e ~1200 séries), sem enviesar pra um gênero específico.
const HOME_CATEGORIES: HomeCategoryConfig[] = [
  { label: 'Top 10 Filmes', term: 'man', type: 'movie' },
  { label: 'Top 10 Séries', term: 'man', type: 'series' },
  { label: 'Comédia', term: 'comedy' },
  { label: 'Ação', term: 'action' },
  { label: 'Terror', term: 'horror' },
  { label: 'Animação', term: 'disney' },
];

export interface OmdbSearchResponse {
  Search?: Array<Record<string, unknown>>;
  totalResults?: string;
  Response: 'True' | 'False';
  Error?: string;
}

export interface OmdbTitleResponse {
  Response: 'True' | 'False';
  Error?: string;
  [key: string]: unknown;
}

// A OMDb retorna os resultados de busca ordenados alfabeticamente por
// título; embaralhamos para o catálogo não parecer uma lista telefônica.
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Os pôsteres da OMDb vêm de um CDN da Amazon (m.media-amazon.com) numa
// versão pré-redimensionada e comprimida (ex.: "..._V1_QL75_UX380_CR0,4,380,562_.jpg",
// ~380px de largura). O mesmo CDN aceita trocar esse sufixo por "_SX<n>" para
// servir uma versão maior e sem o corte/qualidade reduzida do OMDb.
function upgradePosterUrl(poster: unknown, width: number): unknown {
  if (typeof poster !== 'string' || poster === 'N/A') return poster;
  return poster.replace(/\._V1_.*\.jpg$/i, `._V1_SX${width}.jpg`);
}

function upgradeItemPoster<T extends Record<string, unknown>>(
  item: T,
  width: number,
): T {
  if (!('Poster' in item)) return item;
  return { ...item, Poster: upgradePosterUrl(item.Poster, width) };
}

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    // OMDB_API_KEY é validado como obrigatório no boot (ver config/env.validation.ts).
    this.apiKey = this.config.get<string>('OMDB_API_KEY')!;
    this.baseUrl = this.config.get<string>(
      'OMDB_BASE_URL',
      'https://www.omdbapi.com',
    );
  }

  async search(query: string, page = '1'): Promise<OmdbSearchResponse> {
    const data = await this.omdbGet<OmdbSearchResponse>({ s: query, page });
    if (data.Response === 'False') {
      throw new NotFoundException(data.Error ?? 'Nenhum título encontrado');
    }
    const items = shuffle(data.Search ?? []).map((item) =>
      upgradeItemPoster(item, 500),
    );
    return { ...data, Search: items };
  }

  async findById(imdbId: string): Promise<OmdbTitleResponse> {
    const data = await this.omdbGet<OmdbTitleResponse>({
      i: imdbId,
      plot: 'full',
    });
    if (data.Response === 'False') {
      throw new NotFoundException(data.Error ?? 'Título não encontrado');
    }
    return { ...data, Poster: upgradePosterUrl(data.Poster, 1000) };
  }

  async getHome() {
    const rawCategories = await Promise.all(
      HOME_CATEGORIES.map(async ({ label, term, type }) => {
        const data = await this.omdbGet<OmdbSearchResponse>({ s: term, type });
        return { category: label, items: data.Search ?? [] };
      }),
    );

    const categories = rawCategories.map((c) => ({
      ...c,
      items: shuffle(c.items).map((item) => upgradeItemPoster(item, 500)),
    }));

    const candidates = rawCategories.flatMap((c) => c.items);
    const bannerItem =
      candidates[Math.floor(Math.random() * candidates.length)];
    const banner = bannerItem
      ? await this.findById(bannerItem.imdbID as string).catch(() =>
          upgradeItemPoster(bannerItem, 1000),
        )
      : null;

    return { banner, categories };
  }

  private async omdbGet<T>(
    params: Record<string, string | undefined>,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.http.get<T>(this.baseUrl, {
          params: { ...params, apikey: this.apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          `Falha ao consultar a OMDb API: ${error.response?.status} ${JSON.stringify(error.response?.data)}`,
        );
        throw new BadGatewayException(
          'Não foi possível consultar a OMDb API. Verifique se OMDB_API_KEY está configurada corretamente.',
        );
      }
      throw error;
    }
  }
}
