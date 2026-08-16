# Known issues

Levantado numa auditoria de arquitetura/Clean Code em 2026-08-16. O que tinha risco real ou era factualmente errado no README já foi corrigido (ver histórico do git). O que está aqui é o restante: coisas legítimas, mas que são refatoração/produto e não bug crítico — não corrigidas para não expandir escopo sem necessidade.

Cada item tem a localização (`arquivo:linha`) no momento do levantamento; pode ter mudado desde então.

## Segurança / robustez

- **Sem revogação de token.** `JwtStrategy.validate()` (`backend/src/auth/strategies/jwt.strategy.ts`) não consulta o banco — um token continua válido pelos 7 dias mesmo se o usuário for deletado. `logout` só limpa o cookie do lado do cliente.
- **Sem throttle diferenciado no login.** `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])` (`backend/src/app.module.ts`) é global — `POST /auth/login` aceita as mesmas 60 tentativas/minuto que qualquer outra rota, o que facilita credential stuffing.
- **Race condition no registro.** `AuthService.register` (`backend/src/auth/auth.service.ts`) faz `findByEmail` e depois `create` sem transação nem captura do erro `P2002` do Prisma — dois registros simultâneos com o mesmo e-mail derrubam um deles com 500 em vez de 409.
- **Sem normalização de e-mail.** `RegisterDto`/`LoginDto` não fazem lower-case/trim — `User@x.com` e `user@x.com` viram contas distintas apesar do `@unique` no schema.
- **`UsersService.findByEmail`/`findById`** (`backend/src/users/users.service.ts`) devolvem a linha inteira do Prisma, incluindo o hash da senha — hoje é filtrado manualmente em três pontos diferentes (`auth.service.ts`, `auth.controller.ts`); um novo consumidor que esqueça de filtrar vaza o hash.
- **`GET /auth/me`** (`backend/src/auth/auth.controller.ts:66-70`) devolve `200` com corpo `null` quando o usuário do token não existe mais, em vez de `401`/`404`.
- **`JwtAuthGuard`** (`backend/src/auth/guards/jwt-auth.guard.ts`) é uma subclasse vazia, aplicada rota a rota via `@UseGuards`. Não há `APP_GUARD` global com escape hatch `@Public()` — um novo endpoint fica público por padrão se alguém esquecer o decorator.
- **Sem exception filter global.** Erros do Prisma (`P2002`, `P2025`) fora dos poucos pontos já tratados, e qualquer exceção não prevista, caem no formatador default do Nest como 500 cru.

## Performance / integração externa

- **`MoviesService.getHome()`** (`backend/src/movies/movies.service.ts`) faz **6 chamadas paralelas à OMDb + 1 de detalhe do banner** a cada request, sem nenhum cache. A tela de login (`frontend/src/pages/LoginPage.tsx`) chama `useHome()` só para pegar uma imagem de fundo, então a tela pública dispara essas 7 chamadas antes de qualquer autenticação — pesado para o free tier da OMDb (1000 req/dia).
- **`HttpModule` sem timeout/retry** (`backend/src/movies/movies.module.ts`) — uma OMDb lenta trava a requisição pelo tempo default do Node.
- **`Favorite.userId` sem índice próprio** e `year`/`type` como `String?` livre em vez de `Int`/enum (`backend/prisma/schema.prisma`).

## Duplicação (Clean Code)

Corrigidos em 2026-08-16: hook `useToggleFavorite` (`frontend/src/hooks/useFavorites.ts`) unificando `Banner.tsx`/`TitleDetailsPage.tsx`; componente `BlurredBackdrop` (`frontend/src/components/movies/BlurredBackdrop.tsx`, com guarda de `prefers-reduced-motion`) unificando os 3 backdrops; `AuthLayout`/`AuthTextField` (`frontend/src/components/auth/`) unificando Login/Register — a divergência visual entre as duas telas também foi corrigida nesse passo; e normalização de `'N/A'` na borda da API (`frontend/src/lib/normalizeOmdb.ts`, aplicado nos `queryFn` de `useMovies.ts`), removendo as ~23 checagens `campo !== 'N/A'` espalhadas pelos componentes.

Restam:

- **`Navbar.tsx`** duplica quase verbatim o bloco de navegação e o bloco de avatar/logout entre a versão desktop e mobile.
- **Tipos do frontend são cópias manuais** dos DTOs/shapes do backend, sem fonte única — o backend expõe Swagger em `/api/docs` mas nada gera tipos a partir dele. `SearchResponse.Search` está tipado como não-opcional no frontend (`frontend/src/types/movie.ts`) mas o próprio backend o declara opcional (`OmdbSearchResponse.Search?`) — `SearchPage.tsx` desreferencia sem guarda; `SearchBar.tsx` guarda. Inconsistência entre os dois consumidores do mesmo tipo.

## UX / tratamento de erro

- **Sem tratamento global de 401.** Se o cookie expira em sessão, `ProtectedRoute` (`frontend/src/components/layout/ProtectedRoute.tsx`) continua vendo `user` preenchido e o app fica preso numa tela quebrada em vez de redirecionar para `/login`.
- **Nenhuma mutation de favoritos tem `onError`** (`frontend/src/hooks/useFavorites.ts`) — um `ConflictException`/`NotFoundException` do backend é engolido silenciosamente; o coração simplesmente não muda, sem feedback.
- **Sem update otimista** — o ícone de favorito só reflete a mudança depois do round-trip completo + refetch.
- **`SearchPage.tsx`** trata qualquer erro (rede, 500, 401) como "Nenhum título encontrado" — uma falha real fica indistinguível de uma busca sem resultado.
- **Paginação da busca existe no backend** (`SearchMoviesDto.page`) mas nenhum hook do frontend a usa — a busca fica presa na primeira página da OMDb (10 resultados).
- **`logout()`** (`frontend/src/context/AuthContext.tsx`) engole erro da chamada ao servidor e não limpa o cache do React Query — favoritos do usuário anterior podem aparecer brevemente ao logar com outra conta na mesma aba.

## Outros

- **Zero testes no frontend** — nenhuma dependência de teste instalada (`vitest`/`@testing-library`), nenhum arquivo `*.test.*`.
- **`frontend/public/icons.svg`** (5 KB) não é referenciado em lugar nenhum — asset morto.
- **Sem `@ApiCookieAuth`/`@ApiBearerAuth`** no Swagger — rotas protegidas aparecem como públicas na doc e não são testáveis pelo "Try it out".
