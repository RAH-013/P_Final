import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFeaturedCatalog } from "../api/services/catalog";
import type { CatalogItem, MediaType } from "../api/types";

type CatalogFilter = MediaType | "all";

interface FeaturedCatalog {
  items: CatalogItem[];
  total: number;
}

const filters: { label: string; value: CatalogFilter }[] = [
  { label: "Todo", value: "all" },
  { label: "Películas", value: "movie" },
  { label: "Series", value: "series" },
];

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

function CatalogSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-2/3 animate-pulse rounded-xl bg-slate-800" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800" />
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState<CatalogFilter>("all");
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

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [filter, retry]);

  const visibleItems = items;

  const openDetails = (item: CatalogItem) => {
    navigate(`/catalog/${item.type}/${encodeURIComponent(item.id)}`);
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 md:px-8">
      <header className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">
            Descubre algo nuevo
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Explora el catálogo
          </h1>

          <p className="text-sm text-slate-400">
            Encuentra películas y series para tu próxima sesión.
          </p>
        </div>

        <div className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {loading && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <CatalogSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-400/10 bg-red-400/5 px-5 py-16 text-center">
          <p className="text-sm text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && visibleItems.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 px-5 py-16 text-center">
          <p className="text-slate-400">
            No hay contenido disponible en esta categoría.
          </p>
        </div>
      )}

      {!loading && !error && visibleItems.length > 0 && (
        <>
          <p className="text-sm text-slate-400">
            {visibleItems.length} resultados
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleItems.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => openDetails(item)}
                className="group min-w-0 text-left"
              >
                <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-slate-800 shadow-lg shadow-black/20">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={`Póster de ${item.title}`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-linear-to-br from-slate-800 to-slate-900 p-4 text-center">
                      <span className="text-sm font-medium text-slate-500">
                        {item.title}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

                  {item.rating != null && (
                    <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/65 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      ★ {Number(item.rating).toFixed(1)}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-md bg-indigo-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {item.type === "movie" ? "Película" : "Serie"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <h2 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-indigo-400">
                    {item.title}
                  </h2>

                  <p className="truncate text-xs text-slate-400">
                    {item.year ?? "Año desconocido"}
                    {item.genres?.[0] && ` · ${item.genres[0]}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Home;
