import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Film, Search, X } from 'lucide-react';
import { useMovieSearch } from '../../hooks/useMovies';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { cn } from '../../lib/cn';

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  /** Chamado após navegar (ex.: pra fechar o menu mobile). */
  onNavigate?: () => void;
}

export function SearchBar({ className, inputClassName, onNavigate }: SearchBarProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, isLoading } = useMovieSearch(debouncedQuery);
  const results = (data?.Search ?? []).slice(0, 6);
  const showDropdown = isOpen && query.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToSearchPage(term: string) {
    if (!term.trim()) return;
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    setIsOpen(false);
    onNavigate?.();
  }

  function goToTitle(imdbID: string) {
    navigate(`/title/${imdbID}`);
    setQuery('');
    setIsOpen(false);
    onNavigate?.();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const highlighted = results[highlightedIndex];
    if (highlighted) {
      goToTitle(highlighted.imdbID);
    } else {
      goToSearchPage(query);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!showDropdown || results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-neutral-300" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Títulos, gêneros..."
          className={cn(
            'w-full rounded-full border border-white/25 bg-white/10 py-2.5 pr-9 pl-10 text-sm font-medium text-white placeholder:text-neutral-400 focus:border-white focus:bg-white/15 focus:outline-none',
            inputClassName,
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              setQuery('');
              setHighlightedIndex(-1);
            }}
            className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-neutral-900 shadow-2xl">
          {isLoading && (
            <p className="px-4 py-3 text-sm text-neutral-400">Buscando...</p>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-neutral-400">Nenhum título encontrado.</p>
          )}
          {!isLoading &&
            results.map((movie, index) => (
              <button
                key={movie.imdbID}
                type="button"
                onClick={() => goToTitle(movie.imdbID)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                  index === highlightedIndex ? 'bg-white/10' : 'hover:bg-white/5',
                )}
              >
                {movie.Poster && movie.Poster !== 'N/A' ? (
                  <img
                    src={movie.Poster}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-neutral-800">
                    <Film className="h-4 w-4 text-neutral-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{movie.Title}</p>
                  <p className="text-xs text-neutral-400">{movie.Year}</p>
                </div>
              </button>
            ))}
          {!isLoading && results.length > 0 && (
            <button
              type="button"
              onClick={() => goToSearchPage(query)}
              className="w-full border-t border-white/10 px-3 py-2.5 text-center text-sm font-medium text-red-500 hover:bg-white/5"
            >
              Ver todos os resultados
            </button>
          )}
        </div>
      )}
    </div>
  );
}
