import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Film, Tv } from "lucide-react";
import { SearchIcon, type SearchIconHandle } from "lucide-animated";

import {
  searchCatalog,
  type CatalogSearchMatch,
  type CatalogSearchResult,
} from "../api/services/catalog";
import type { MediaType } from "../api/types";

interface SearchPosterProps {
  poster?: string | null;
  title: string;
  type: MediaType;
}

interface HeaderSearchProps {
  onSelect?: (item: CatalogSearchMatch) => void;
}

function getValidPosterUrl(poster?: string | null): string | null {
  if (!poster) return null;
  const trimmed = poster.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A") return null;
  return trimmed;
}

function SearchPoster({ poster, title, type }: SearchPosterProps) {
  const validPoster = getValidPosterUrl(poster);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !validPoster) return;

    if (img.complete) {
      if (img.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setFailed(true);
      }
    }
  }, [validPoster]);

  const MediaIcon = type === "movie" ? Film : Tv;
  const showFallback = !validPoster || failed;

  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-800/90">
      {!showFallback && !loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-700 via-slate-800 to-slate-700"
        />
      )}

      {showFallback ? (
        <MediaIcon className="size-5 text-sky-400/70" strokeWidth={1.6} />
      ) : (
        <img
          ref={imgRef}
          src={validPoster}
          alt={`Póster de ${title}`}
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
      <div className="size-14 shrink-0 animate-pulse rounded-xl bg-linear-to-br from-slate-700/80 via-slate-800 to-slate-700/80" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded-md bg-slate-800" />
        <div className="h-3 w-1/3 animate-pulse rounded-md bg-slate-800/80" />
      </div>
    </div>
  );
}

function HeaderSearch({ onSelect }: HeaderSearchProps) {
  const navigate = useNavigate();

  const searchRef = useRef<SearchIconHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const animate = () => searchRef.current?.startAnimation();
  const stop = () => searchRef.current?.stopAnimation();

  const items: CatalogSearchMatch[] = useMemo(() => {
    if (!results) return [];
    return results.matches.length > 0 ? results.matches : results.suggestions;
  }, [results]);

  const cancelPendingSearch = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const executeSearch = useCallback(
    async (rawQuery: string, autoNavigateFirst = false) => {
      const value = rawQuery.trim();
      if (value.length < 2) return;

      cancelPendingSearch();

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      setLoading(true);
      setError(null);
      setOpen(true);

      try {
        const response = await searchCatalog({ q: value }, controller.signal);

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        const nextItems =
          response.matches.length > 0 ? response.matches : response.suggestions;

        if (autoNavigateFirst && nextItems.length > 0) {
          const topItem = nextItems[0];
          setOpen(false);
          onSelect?.(topItem);
          navigate(`/${topItem.type}/${encodeURIComponent(topItem.id)}`);
          return;
        }

        setResults(response);
        setActiveIndex(0);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setResults(null);
          setError("No fue posible realizar la búsqueda.");
          setOpen(true);
        }
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [cancelPendingSearch, navigate, onSelect],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      cancelPendingSearch();
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      void executeSearch(value, false);
    }, 300);

    return () => {
      cancelPendingSearch();
    };
  }, [query, executeSearch, cancelPendingSearch]);

  const handleQueryChange = (value: string) => {
    const hasMinChars = value.trim().length >= 2;

    requestIdRef.current += 1;
    setQuery(value);
    setResults(null);
    setError(null);
    setActiveIndex(0);
    setLoading(hasMinChars);
    setOpen(hasMinChars);
  };

  const clearSearch = () => {
    requestIdRef.current += 1;
    cancelPendingSearch();
    setQuery("");
    setResults(null);
    setError(null);
    setLoading(false);
    setOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const handleSelectItem = useCallback(
    (item: CatalogSearchMatch) => {
      setOpen(false);
      onSelect?.(item);
      navigate(`/${item.type}/${encodeURIComponent(item.id)}`);
    },
    [navigate, onSelect],
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();
    if (value.length < 2) return;

    if (!loading && items.length > 0) {
      const selected = items[activeIndex] ?? items[0];
      if (selected) {
        handleSelectItem(selected);
        return;
      }
    }

    void executeSearch(value, true);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (items.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      if (items.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const isDropdownVisible = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <form role="search" onSubmit={handleFormSubmit} className="w-full">
        <div
          className="group flex h-10 items-center gap-3 rounded-xl border border-white/15 bg-slate-900/50 px-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all duration-200 hover:border-white/25 hover:bg-slate-900/70 focus-within:border-sky-400/50 focus-within:bg-slate-900/80 focus-within:ring-4 focus-within:ring-sky-500/15 sm:h-11"
          onMouseEnter={animate}
          onMouseLeave={stop}
        >
          <SearchIcon
            ref={searchRef}
            size={18}
            animateOnHover={false}
            className="shrink-0 text-slate-400 transition-colors group-focus-within:text-sky-400"
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
            aria-activedescendant={
              isDropdownVisible && items[activeIndex]
                ? `search-option-${items[activeIndex].type}-${items[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setOpen(true);
              }
            }}
            className="h-full w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
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
          className="scrollbar-none absolute left-0 top-full z-50 mt-2.5 max-h-104 w-full overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-slate-950/95 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
              {items.map((item, index) => {
                const isHighlighted = index === activeIndex;
                const isMovie = item.type === "movie";
                const MediaIcon = isMovie ? Film : Tv;

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    id={`search-option-${item.type}-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelectItem(item)}
                    className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors focus-visible:outline-none ${
                      isHighlighted
                        ? "bg-sky-500/15 ring-1 ring-sky-400/35"
                        : "hover:bg-white/[0.07]"
                    }`}
                  >
                    <SearchPoster
                      key={`${item.type}-${item.id}-${item.poster ?? "no-poster"}`}
                      poster={item.poster}
                      title={item.title}
                      type={item.type}
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <p
                        className={`truncate text-sm font-medium transition-colors ${
                          isHighlighted ? "text-sky-300" : "text-white"
                        }`}
                      >
                        {item.title}
                      </p>

                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <MediaIcon className="size-3 text-sky-400/80" />
                        {isMovie ? "Película" : "Serie"}
                      </span>
                    </div>

                    <ArrowUpRight
                      className={`size-4 shrink-0 transition-all ${
                        isHighlighted
                          ? "translate-x-0.5 -translate-y-0.5 text-sky-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeaderSearch;
