import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ example: 'tt0133093' })
  @IsString()
  @IsNotEmpty()
  imdbId: string;

  @ApiProperty({ example: 'The Matrix' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  poster?: string;

  @ApiPropertyOptional({ example: '1999' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: 'movie' })
  @IsOptional()
  @IsString()
  type?: string;
}
