# Voxterflix

Catálogo de filmes e séries inspirado na Netflix, desenvolvido como teste técnico para o processo seletivo da Voxter. A aplicação consome dados reais de filmes/séries da [OMDb API](https://www.omdbapi.com) e conta com autenticação própria, catálogo com carrosséis por categoria, busca, tela de detalhes e uma lista de favoritos ("Minha Lista") vinculada ao usuário logado.

## Stack

**Backend** — `backend/`
- [NestJS 11](https://nestjs.com/) + TypeScript
- [Prisma 7](https://www.prisma.io/) + PostgreSQL (via driver adapter `@prisma/adapter-pg`)
- Autenticação JWT (`@nestjs/jwt` + `passport-jwt`) com senhas hasheadas via `bcrypt`
- `@nestjs/axios` para consumir a OMDb API
- `@nestjs/swagger` para documentação interativa da API
- `helmet` + `@nestjs/throttler` para segurança básica e rate limiting

**Frontend** — `frontend/`
- [React 19](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) para a identidade visual inspirada na Netflix
- [React Router 8](https://reactrouter.com/) para as rotas
- [TanStack Query](https://tanstack.com/query) para cache/estado assíncrono das chamadas à API
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para os formulários de login/cadastro
- [Embla Carousel](https://www.embla-carousel.com/) para os carrosséis de categorias

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.19+ ou 22.12+ (exigido pelo Vite 8 e pelo Prisma 7)
- [Docker](https://www.docker.com/) e Docker Compose (para o PostgreSQL)
- Uma chave gratuita da OMDb API — crie a sua em https://www.omdbapi.com/apikey.aspx (é enviada por e-mail e precisa ser confirmada antes de funcionar)

## Como rodar o projeto

### 1. Banco de dados

Na raiz do repositório:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 em `localhost:5432` (usuário/senha/banco: `voxter`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# edite o .env e informe sua OMDB_API_KEY
npm install
npx prisma migrate dev
npm run start:dev
```

A API sobe em `http://localhost:3000/api`, com documentação Swagger em `http://localhost:3000/api/docs`.

> `npm install` já roda `prisma generate` automaticamente (script `postinstall`).

### 3. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Variáveis de ambiente

### `backend/.env`

| Variável | Obrigatória | Descrição | Exemplo |
|---|---|---|---|
| `PORT` | não (padrão `3000`) | Porta da API | `3000` |
| `FRONTEND_URL` | não (padrão `http://localhost:5173`) | Origem liberada no CORS | `http://localhost:5173` |
| `DATABASE_URL` | **sim** | String de conexão do PostgreSQL | `postgresql://voxter:voxter@localhost:5432/voxter?schema=public` |
| `JWT_SECRET` | **sim** | Segredo usado para assinar os tokens JWT | qualquer string longa e aleatória |
| `JWT_EXPIRES_IN` | não (padrão `7d`) | Validade do token | `7d` |
| `OMDB_API_KEY` | **sim** | Chave da OMDb API | obtida em omdbapi.com/apikey.aspx |
| `OMDB_BASE_URL` | não (padrão `https://www.omdbapi.com`) | Base URL da OMDb API | `https://www.omdbapi.com` |
| `NODE_ENV` | não | Controla a flag `secure` do cookie de sessão (só é ativada com `production`) | `development` |

As três variáveis obrigatórias são validadas na inicialização (`backend/src/config/env.validation.ts`) — a API não sobe se alguma faltar.

### `frontend/.env`

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API do backend | `http://localhost:3000/api` |

## Autenticação

O login/cadastro devolve o token JWT num **cookie httpOnly** (`voxter_token`), não num header `Authorization`. O frontend depende disso (`withCredentials: true` no client Axios) e é por isso que `FRONTEND_URL`/CORS precisa apontar exatamente para a origem do frontend.

## Endpoints

Prefixo global: `/api`.

| Método | Rota | Autenticado |
|---|---|---|
| GET | `/` | não |
| POST | `/auth/register` | não |
| POST | `/auth/login` | não |
| POST | `/auth/logout` | não |
| GET | `/auth/me` | sim |
| GET | `/movies/home` | não |
| GET | `/movies/search?q=&page=` | não |
| GET | `/movies/:imdbId` | não |
| GET | `/favorites` | sim |
| POST | `/favorites` | sim |
| DELETE | `/favorites/:imdbId` | sim |

Documentação interativa (Swagger) em `http://localhost:3000/api/docs` — como a autenticação é via cookie, "Try it out" só funciona nas rotas protegidas se você já tiver um cookie válido no navegador.

## Scripts úteis

**Backend** (`backend/`)
- `npm run start:dev` — sobe a API em modo watch
- `npm run build` — build de produção
- `npm run test` — testes unitários de `AuthService`, `FavoritesService` e `MoviesService` (hash/verificação de senha, não-enumeração de usuário no login, regras de conflito/not-found dos favoritos, mapeamento de erros da OMDb e reescrita de URL de pôster)
- `npm run test:e2e` — smoke test de boot da aplicação (requer Postgres rodando, ver `docker compose up -d`)
- `npx prisma studio` — interface visual para inspecionar o banco

**Frontend** (`frontend/`)
- `npm run dev` — sobe o app em modo desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — lint do código

## Funcionalidades

- Cadastro e login (JWT)
- Catálogo com banner de destaque e carrosséis por categoria (a OMDb não expõe um endpoint de "categorias"/"em alta"; os carrosséis são montados no backend a partir de buscas por termos fixos, ver `backend/src/movies/movies.service.ts`)
- Busca de títulos
- Tela de detalhes (pôster, sinopse, elenco, ano, nota IMDb)
- "Minha Lista": adicionar/remover favoritos vinculados ao usuário logado

