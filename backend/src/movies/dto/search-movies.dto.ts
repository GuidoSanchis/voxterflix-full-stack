import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class SearchMoviesDto {
  @ApiPropertyOptional({ example: 'matrix' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'page deve ser um número' })
  page?: string;
}
