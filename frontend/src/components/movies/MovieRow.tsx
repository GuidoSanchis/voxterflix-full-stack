import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MovieSummary } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { cn } from '../../lib/cn';
import { useInView } from '../../hooks/useInView';

interface MovieRowProps {
  title: string;
  items: MovieSummary[];
  /** Estilo "Top 10": número grande atrás do pôster, tipo os rankings da Netflix. */
  ranked?: boolean;
}

export function MovieRow({ title, items, ranked = false }: MovieRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const { ref: sectionRef, isInView } = useInView<HTMLElement>();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sincroniza o estado dos botões com a API imperativa do embla assim que ela fica pronta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  const restOfTitle = ranked ? title.replace(/^Top 10\s*/i, '') : title;

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative py-4 transition-all duration-700 ease-out',
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <h2 className="mb-3 flex items-center gap-2.5 px-4 sm:mb-4 sm:px-8">
        {ranked && (
          <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-xs font-black tracking-wide text-white">
            TOP 10
          </span>
        )}
        <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {restOfTitle}
        </span>
      </h2>

      <div className="group/row relative">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => emblaApi?.scrollPrev()}
          className={cn(
            'absolute inset-y-0 left-0 z-20 hidden w-10 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex',
            !canScrollPrev && 'pointer-events-none opacity-0!',
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="overflow-hidden px-4 sm:px-8" ref={emblaRef}>
          {/* py extra dá espaço pro card crescer com o hover:scale-110 sem que o
              overflow-hidden do carrossel corte o rodapé (ano) e as bordas arredondadas. */}
          <div className="flex gap-2 py-4 sm:py-6">
            {items.map((movie, index) =>
              ranked ? (
                <div key={movie.imdbID} className="flex shrink-0 items-end">
                  <span
                    aria-hidden="true"
                    className="-mr-2 pb-1 text-[7.5rem] leading-none font-black text-transparent select-none [-webkit-text-stroke:4px_rgba(163,163,163,0.7)] sm:-mr-3 sm:text-[10rem]"
                  >
                    {index + 1}
                  </span>
                  <MovieCard movie={movie} className="relative z-10" />
                </div>
              ) : (
                <MovieCard key={movie.imdbID} movie={movie} />
              ),
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Próximo"
          onClick={() => emblaApi?.scrollNext()}
          className={cn(
            'absolute inset-y-0 right-0 z-20 hidden w-10 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover/row:opacity-100 sm:flex',
            !canScrollNext && 'pointer-events-none opacity-0!',
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
