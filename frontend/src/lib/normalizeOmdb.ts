// A OMDb usa a string "N/A" como marcador de "campo ausente" em vez de omitir
// a chave — isso vazava pelos componentes como `campo && campo !== 'N/A'`
// repetido dezenas de vezes. Normalizamos uma vez, na borda da API, trocando
// "N/A" por undefined recursivamente (cobre os arrays de busca/categorias e
// os objetos de rating aninhados) — depois disso, um truthy check simples basta.
const NA = 'N/A';

export function normalizeOmdbNA<T>(value: T): T {
  return normalize(value) as T;
}

function normalize(value: unknown): unknown {
  if (value === NA) return undefined;
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, normalize(v)]),
    );
  }
  return value;
}
