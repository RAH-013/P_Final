import { useEffect, useRef, useState } from "react";
import { SearchIcon, type SearchIconHandle } from "lucide-animated";

import {
  searchCatalog,
  type CatalogSearchResult,
  type CatalogSearchMatch,
} from "../api/services/catalog";

interface SearchPosterProps {
  poster?: string | null;
  title: string;
}

interface HeaderSearchProps {
  onSelect?: (item: CatalogSearchMatch) => void;
}

function SearchPoster({ poster, title }: SearchPosterProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleImgRef = (node: HTMLImageElement | null) => {
    if (!node || !node.complete || loaded || failed) return;

    if (node.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-800">
      {(!poster || !loaded || failed) && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-700 via-slate-800 to-slate-700"
        />
      )}

      {poster && !failed && (
        <img
          ref={handleImgRef}
          src={poster}
          alt={`Póster de ${title}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

function SearchResultSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 rounded-xl p-2">
      <div className="size-14 shrink-0 animate-pulse rounded-lg bg-linear-to-br from-slate-700/80 via-slate-800 to-slate-700/80" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-slate-800" />
        <div className="h-3 w-1/3 animate-pulse rounded-md bg-slate-800/80" />
      </div>
    </div>
  );
}

function HeaderSearch({ onSelect }: HeaderSearchProps) {
  const searchRef = useRef<SearchIconHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const animate = () => searchRef.current?.startAnimation();
  const stop = () => searchRef.current?.stopAnimation();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) return;

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchCatalog({ q: value }, controller.signal);

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setResults(response);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setResults(null);
          setError("No fue posible realizar la búsqueda.");
        }
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleQueryChange = (value: string) => {
    const hasMinChars = value.trim().length >= 2;

    requestIdRef.current += 1;
    setQuery(value);
    setResults(null);
    setError(null);
    setLoading(hasMinChars);
    setOpen(hasMinChars);
  };

  const clearSearch = () => {
    requestIdRef.current += 1;
    setQuery("");
    setResults(null);
    setError(null);
    setLoading(false);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectItem = (item: CatalogSearchMatch) => {
    setOpen(false);
    onSelect?.(item);
  };

  const items: CatalogSearchMatch[] = results
    ? results.matches.length > 0
      ? results.matches
      : results.suggestions
    : [];

  const isDropdownVisible = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="w-full"
      >
        <div
          className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] focus-within:border-indigo-400/50 focus-within:bg-white/[0.07] focus-within:ring-4 focus-within:ring-indigo-500/10"
          onMouseEnter={animate}
          onMouseLeave={stop}
        >
          <SearchIcon
            ref={searchRef}
            size={19}
            animateOnHover={false}
            className="shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-400"
          />

          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            placeholder="Buscar películas y series..."
            aria-label="Buscar películas y series"
            aria-expanded={isDropdownVisible}
            aria-controls="catalog-search-results"
            autoComplete="off"
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => setOpen(true)}
            className="h-11 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-[#55d6c7] transition-all hover:bg-[#55d6c7]/10 hover:text-[#75f0df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55d6c7]"
            >
              ×
            </button>
          )}
        </div>
      </form>

      {isDropdownVisible && (
        <div
          id="catalog-search-results"
          role="listbox"
          aria-busy={loading}
          className="absolute left-0 top-full z-50 mt-3 max-h-105 w-full overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading && (
            <div className="space-y-1">
              {Array.from({ length: 4 }, (_, index) => (
                <SearchResultSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-5 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && results && (
            <div className="px-4 py-5 text-center text-sm text-slate-400">
              No se encontraron resultados.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelectItem(item)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-none"
                >
                  <SearchPoster
                    key={`${item.type}-${item.id}-${item.poster ?? "no-poster"}`}
                    poster={item.poster}
                    title={item.title}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {item.type === "movie" ? "Película" : "Serie"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeaderSearch;
