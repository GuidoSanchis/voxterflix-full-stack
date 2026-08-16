import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: {
    favorite: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  const userId = 'user-1';
  const existingFavorite = {
    id: 'fav-1',
    userId,
    imdbId: 'tt0111161',
    title: 'The Shawshank Redemption',
    poster: 'http://example.com/poster.jpg',
    year: '1994',
    type: 'movie',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      favorite: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FavoritesService);
  });

  describe('findAllByUser', () => {
    it('filtra pelo usuário e ordena pelos mais recentes primeiro', async () => {
      prisma.favorite.findMany.mockResolvedValue([existingFavorite]);

      const result = await service.findAllByUser(userId);

      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([existingFavorite]);
    });
  });

  describe('add', () => {
    it('rejeita título já favoritado sem criar duplicata', async () => {
      prisma.favorite.findUnique.mockResolvedValue(existingFavorite);

      await expect(
        service.add(userId, {
          imdbId: existingFavorite.imdbId,
          title: existingFavorite.title,
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.favorite.create).not.toHaveBeenCalled();
    });

    it('cria o favorito vinculado ao usuário quando ainda não existe', async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);
      prisma.favorite.create.mockResolvedValue(existingFavorite);

      const dto = { imdbId: 'tt9999999', title: 'Novo Título' };
      await service.add(userId, dto);

      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
    });
  });

  describe('remove', () => {
    it('lança NotFoundException quando o título não está na lista', async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, 'tt0000000')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.favorite.delete).not.toHaveBeenCalled();
    });

    it('remove o favorito existente', async () => {
      prisma.favorite.findUnique.mockResolvedValue(existingFavorite);
      prisma.favorite.delete.mockResolvedValue(existingFavorite);

      await service.remove(userId, existingFavorite.imdbId);

      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: { id: existingFavorite.id },
      });
    });
  });
});
