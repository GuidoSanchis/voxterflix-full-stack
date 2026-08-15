import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Rotas estáticas ("home", "search") precisam vir antes de ":imdbId",
  // senão o Nest tentaria casá-las com o parâmetro dinâmico.
  @Get('home')
  getHome() {
    return this.moviesService.getHome();
  }

  @Get('search')
  search(@Query() query: SearchMoviesDto) {
    return this.moviesService.search(query.q, query.page ?? '1');
  }

  @Get(':imdbId')
  findOne(@Param('imdbId') imdbId: string) {
    return this.moviesService.findById(imdbId);
  }
}
