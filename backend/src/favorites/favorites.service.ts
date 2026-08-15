import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, dto: AddFavoriteDto) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_imdbId: { userId, imdbId: dto.imdbId } },
    });
    if (existing) {
      throw new ConflictException('Título já está na sua lista');
    }

    return this.prisma.favorite.create({ data: { ...dto, userId } });
  }

  async remove(userId: string, imdbId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_imdbId: { userId, imdbId } },
    });
    if (!existing) {
      throw new NotFoundException('Título não está na sua lista');
    }

    await this.prisma.favorite.delete({ where: { id: existing.id } });
  }
}
