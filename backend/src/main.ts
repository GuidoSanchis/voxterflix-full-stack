import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  const frontendUrl = config.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  // 'localhost' e '127.0.0.1' são origens distintas para o navegador mesmo
  // apontando para o mesmo servidor — libera as duas variantes em dev.
  const allowedOrigins = [
    frontendUrl,
    frontendUrl.replace('localhost', '127.0.0.1'),
    frontendUrl.replace('127.0.0.1', 'localhost'),
  ];
  app.enableCors({
    origin: [...new Set(allowedOrigins)],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voxter Movie Catalog API')
    .setDescription(
      'API do catálogo de filmes/séries inspirado na Netflix, consumindo a OMDb API',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<string>('PORT', '3000');
  await app.listen(port);
}
void bootstrap();
