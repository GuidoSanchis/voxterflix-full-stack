import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.favoritesService.findAllByUser(user.userId);
  }

  @Post()
  add(@CurrentUser() user: CurrentUserPayload, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(user.userId, dto);
  }

  @Delete(':imdbId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('imdbId') imdbId: string,
  ) {
    return this.favoritesService.remove(user.userId, imdbId);
  }
}
