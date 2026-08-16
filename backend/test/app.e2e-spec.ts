import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Espelha o setGlobalPrefix('api') de src/main.ts — sem isso, o teste
    // batia em GET / (sem prefixo), uma rota que não existe fora do ambiente
    // de teste, e não exercitava a superfície real da API.
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Voxterflix API');
  });

  afterEach(async () => {
    await app.close();
  });
});
