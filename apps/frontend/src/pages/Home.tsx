import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  Film,
  Flame,
  RefreshCw,
  Star,
  Tv,
} from "lucide-react";
import { SparklesIcon, type SparklesIconHandle } from "lucide-animated";

import { getFeaturedCatalog } from "../api/services/catalog";
import type { CatalogItem, MediaType } from "../api/types";

type CatalogFilter = MediaType | "all";

interface FeaturedCatalog {
  items: CatalogItem[];
  total: number;
}

const HERO_INTERVAL_MS = 6000;

const filters: readonly {
  label: string;
  value: CatalogFilter;
  icon: typeof Clapperboard;
}[] = [
  { label: "Todo", value: "all", icon: Clapperboard },
  { label: "Películas", value: "movie", icon: Film },
  { label: "Series", value: "series", icon: Tv },
];

const glassCardClass =
  "relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/45 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150";

function normalizeCatalog(response: unknown): FeaturedCatalog {
  if (!response || typeof response !== "object") {
    throw new Error("Respuesta de catálogo inválida");
  }

  const outer = response as Record<string, unknown>;

  const payload =
    outer.data && typeof outer.data === "object"
      ? (outer.data as Record<string, unknown>)
      : outer;

  if (!Array.isArray(payload.items)) {
    throw new Error("La respuesta no contiene una lista de películas y series");
  }

  return {
    items: payload.items as CatalogItem[],
    total:
      typeof payload.total === "number" ? payload.total : payload.items.length,
  };
}

function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-5 py-6 pb-28 md:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end">
          <div className="hidden aspect-2/3 w-48 shrink-0 animate-pulse rounded-2xl bg-slate-800/90 md:block lg:w-56" />

          <div className="w-full space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-28 animate-pulse rounded-full bg-slate-800" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-800/80" />
            </div>
            <div className="h-10 w-3/4 max-w-lg animate-pulse rounded-2xl bg-slate-800" />
            <div className="h-4 w-48 animate-pulse rounded bg-slate-800/80" />
            <div className="h-16 max-w-2xl animate-pulse rounded-2xl bg-slate-800/70" />
            <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-11 w-64 animate-pulse rounded-xl bg-slate-800/80" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className={glassCardClass}>
            <div className="aspect-2/3 animate-pulse bg-slate-800/80" />
            <div className="space-y-2 border-t border-white/10 p-3.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const heroSparklesRef = useRef<SparklesIconHandle>(null);

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError(null);

      try {
        const response = await getFeaturedCatalog(filter);
        const catalog = normalizeCatalog(response);

        if (!cancelled) {
          setItems(catalog.items);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setError("No fue posible cargar el catálogo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [filter, retry]);

  const featuredSlides = useMemo(() => {
    const withArtwork = items.filter((item) => item.background || item.poster);
    return (withArtwork.length > 0 ? withArtwork : items).slice(0, 6);
  }, [items]);

  const activeHeroIndex =
    featuredSlides.length > 0 ? heroIndex % featuredSlides.length : 0;
  const activeHero = featuredSlides[activeHeroIndex] ?? null;

  useEffect(() => {
    if (featuredSlides.length <= 1 || heroPaused || loading) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % featuredSlides.length);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [featuredSlides.length, heroPaused, loading]);

  const openDetails = (item: CatalogItem) => {
    navigate(`/${item.type}/${encodeURIComponent(item.id)}`);
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-6 pb-28 md:px-8">
      <style>{`
        @keyframes heroContentEnter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroPosterEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes heroKenBurns {
          0% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1.12);
          }
        }

        @keyframes heroProgressFill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>

      {!error && activeHero && (
        <section
          aria-label="Títulos destacados"
          onMouseEnter={() => {
            setHeroPaused(true);
            heroSparklesRef.current?.startAnimation();
          }}
          onMouseLeave={() => {
            setHeroPaused(false);
            heroSparklesRef.current?.stopAnimation();
          }}
          className="relative isolate overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 shadow-[0_30px_80px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        >
          {featuredSlides.map((slide, index) => {
            const isCurrent = index === activeHeroIndex;
            const artwork = slide.background || slide.poster;

            if (!artwork) return null;

            return (
              <img
                key={`${slide.type}-${slide.id}-bg`}
                src={artwork}
                alt=""
                aria-hidden="true"
                style={{
                  animation: isCurrent
                    ? "heroKenBurns 14s ease-in-out infinite alternate"
                    : "none",
                }}
                className={`pointer-events-none absolute inset-0 -z-20 size-full object-cover object-center transition-opacity duration-1000 ease-out ${
                  isCurrent ? "opacity-55" : "opacity-0"
                }`}
              />
            );
          })}

          {!activeHero.background && !activeHero.poster && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 -z-20 size-96 rounded-full bg-sky-500/20 blur-3xl"
            />
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/35"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-slate-950 via-slate-950/35 to-slate-950/40"
          />

          <div className="flex flex-col gap-7 p-6 sm:p-8 md:flex-row md:items-end lg:gap-10 lg:p-10">
            <button
              key={`${activeHero.type}-${activeHero.id}-poster`}
              type="button"
              onClick={() => openDetails(activeHero)}
              aria-label={`Abrir ${activeHero.title}`}
              style={{
                animation:
                  "heroPosterEnter 550ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              className="group relative hidden aspect-2/3 w-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:-translate-y-1 md:block lg:w-56"
            >
              {activeHero.poster ? (
                <img
                  src={activeHero.poster}
                  alt={`Póster de ${activeHero.title}`}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-800 to-slate-950 p-4 text-center text-slate-400">
                  {activeHero.type === "movie" ? (
                    <Film className="size-9 text-sky-400/70" />
                  ) : (
                    <Tv className="size-9 text-sky-400/70" />
                  )}
                  <span className="text-xs">{activeHero.title}</span>
                </div>
              )}
            </button>

            <div className="min-w-0 flex-1 space-y-4">
              <div
                key={`${activeHero.type}-${activeHero.id}-details`}
                style={{
                  animation:
                    "heroContentEnter 550ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/35 bg-sky-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-md">
                    <SparklesIcon
                      ref={heroSparklesRef}
                      size={13}
                      animateOnHover={false}
                    />
                    Destacado
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    {activeHero.type === "movie" ? (
                      <Film className="size-3 text-sky-400" />
                    ) : (
                      <Tv className="size-3 text-sky-400" />
                    )}
                    {activeHero.type === "movie" ? "Película" : "Serie"}
                  </span>

                  {activeHero.rating != null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {Number(activeHero.rating).toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  <h1 className="line-clamp-2 text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {activeHero.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-300 sm:text-sm">
                    {activeHero.year && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-sky-400" />
                        {activeHero.year}
                      </span>
                    )}

                    {activeHero.runtime && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5 text-sky-400" />
                        {activeHero.runtime}
                      </span>
                    )}

                    {activeHero.genres && activeHero.genres.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {activeHero.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-[11px] font-medium text-slate-200"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {activeHero.synopsis && (
                  <p className="line-clamp-3 max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm lg:text-base">
                    {activeHero.synopsis}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => openDetails(activeHero)}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-[0_10px_25px_-4px_rgba(14,165,233,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all hover:brightness-110 active:scale-[0.98] sm:text-sm"
                >
                  <span>Explorar título</span>
                  <ArrowUpRight className="size-4" />
                </button>

                {featuredSlides.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {featuredSlides.map((slide, index) => {
                        const isCurrent = index === activeHeroIndex;

                        return (
                          <button
                            key={`${slide.type}-${slide.id}-dot`}
                            type="button"
                            onClick={() => setHeroIndex(index)}
                            aria-label={`Ver destacado ${index + 1}: ${slide.title}`}
                            aria-pressed={isCurrent}
                            className={`relative h-2 cursor-pointer overflow-hidden rounded-full transition-all duration-300 ${
                              isCurrent
                                ? "w-9 bg-white/25"
                                : "w-2 bg-white/25 hover:bg-white/45"
                            }`}
                          >
                            {isCurrent && (
                              <span
                                key={`progress-${activeHeroIndex}`}
                                style={{
                                  animation: `heroProgressFill ${HERO_INTERVAL_MS}ms linear forwards`,
                                  animationPlayState: heroPaused
                                    ? "paused"
                                    : "running",
                                }}
                                className="absolute inset-0 origin-left rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.85)]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="ml-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex(
                            (current) =>
                              (current - 1 + featuredSlides.length) %
                              featuredSlides.length,
                          )
                        }
                        aria-label="Destacado anterior"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-slate-950/60 text-slate-300 backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronLeft className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex(
                            (current) => (current + 1) % featuredSlides.length,
                          )
                        }
                        aria-label="Siguiente destacado"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-slate-950/60 text-slate-300 backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-white sm:text-base">
              <Flame className="size-4 text-sky-400" />
              <h2>Explora el catálogo</h2>
            </div>

            {!error && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold tabular-nums text-slate-300">
                {items.length} {items.length === 1 ? "título" : "títulos"}
              </span>
            )}
          </div>

          <div
            role="group"
            aria-label="Filtrar catálogo por tipo"
            className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
          >
            {filters.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFilter(option.value);
                    setHeroIndex(0);
                  }}
                  aria-pressed={isActive}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all sm:text-sm ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
          >
            <span className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </span>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div
            className={`${glassCardClass} flex flex-col items-center justify-center gap-3 px-6 py-16 text-center`}
          >
            <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
              <Clapperboard className="size-6" />
            </div>

            <h3 className="text-base font-semibold text-white">
              No hay contenido disponible en esta categoría
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const isMovie = item.type === "movie";
              const MediaIcon = isMovie ? Film : Tv;

              return (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => openDetails(item)}
                  aria-label={`Ver detalles de ${item.title}`}
                  className={`${glassCardClass} group flex min-w-0 cursor-pointer flex-col text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/45 hover:shadow-[0_24px_60px_rgba(14,165,233,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
                >
                  <div className="relative aspect-2/3 w-full overflow-hidden bg-slate-900">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={`Póster de ${item.title}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-3 bg-linear-to-br from-slate-800/80 to-slate-950 p-4 text-center text-slate-500">
                        <MediaIcon
                          className="size-10 text-sky-400/60"
                          strokeWidth={1.4}
                        />
                        <span className="line-clamp-2 text-xs font-medium text-slate-400">
                          {item.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-xl">
                      <MediaIcon className="size-3" />
                      {isMovie ? "Película" : "Serie"}
                    </span>

                    {item.rating != null && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-xl">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {Number(item.rating).toFixed(1)}
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3.5">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-sky-300 sm:text-base">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span>{item.year ?? "Año desconocido"}</span>

                        {item.genres?.[0] && (
                          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur-md">
                            {item.genres[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/10 px-3.5 py-2.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-sky-300">
                    <span>Ver ficha</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
