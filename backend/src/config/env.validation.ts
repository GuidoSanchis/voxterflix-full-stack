import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

// Falha o boot da aplicação cedo (em vez de deixar cada serviço lidar com
// `undefined` em runtime) quando uma env var obrigatória está ausente.
// Ver backend/src/auth/strategies/jwt.strategy.ts e movies.service.ts, que
// antes tinham fallbacks silenciosos para JWT_SECRET/OMDB_API_KEY.
class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsNotEmpty()
  OMDB_API_KEY!: string;

  @IsOptional()
  @IsString()
  OMDB_BASE_URL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missing = errors.map((error) => error.property).join(', ');
    throw new Error(
      `Variáveis de ambiente inválidas ou ausentes: ${missing}. Confira o .env (veja .env.example).`,
    );
  }

  return validated;
}
