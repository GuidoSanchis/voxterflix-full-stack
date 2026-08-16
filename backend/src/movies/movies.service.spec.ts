import { HttpService } from '@nestjs/axios';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { MoviesService } from './movies.service';

function axiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}

describe('MoviesService', () => {
  let service: MoviesService;
  let http: { get: jest.Mock };

  beforeEach(async () => {
    http = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: HttpService, useValue: http },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) =>
              ({ OMDB_API_KEY: 'test-key' })[key] ?? fallback,
          },
        },
      ],
    }).compile();

    service = module.get(MoviesService);
  });

  describe('findById', () => {
    it('reescreve o pôster para a versão em alta resolução do CDN', async () => {
      http.get.mockReturnValue(
        of(
          axiosResponse({
            Response: 'True',
            imdbID: 'tt0111161',
            Poster:
              'https://m.media-amazon.com/images/M/foo._V1_QL75_UX380_CR0,4,380,562_.jpg',
          }),
        ),
      );

      const result = await service.findById('tt0111161');

      expect(result.Poster).toBe(
        'https://m.media-amazon.com/images/M/foo._V1_SX1000.jpg',
      );
    });

    it('preserva o valor "N/A" em vez de reescrever', async () => {
      http.get.mockReturnValue(
        of(axiosResponse({ Response: 'True', imdbID: 'tt1', Poster: 'N/A' })),
      );

      const result = await service.findById('tt1');

      expect(result.Poster).toBe('N/A');
    });

    it('mapeia "Incorrect IMDb ID" para 404', async () => {
      http.get.mockReturnValue(
        of(
          axiosResponse({
            Response: 'False',
            Error: 'Incorrect IMDb ID.',
          }),
        ),
      );

      await expect(service.findById('tt-invalido')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('mapeia falha de chave/limite da OMDb para 502, não 404', async () => {
      http.get.mockReturnValue(
        of(
          axiosResponse({
            Response: 'False',
            Error: 'Invalid API key!',
          }),
        ),
      );

      await expect(service.findById('tt0111161')).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });
  });

  describe('search', () => {
    it('propaga erro de rede como BadGatewayException', async () => {
      http.get.mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          response: { status: 503, data: {} },
        })),
      );

      await expect(service.search('matrix')).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });

    it('rethrows erros que não são do axios', async () => {
      const boom = new Error('boom');
      http.get.mockReturnValue(throwError(() => boom));

      await expect(service.search('matrix')).rejects.toBe(boom);
    });
  });
});
