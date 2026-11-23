import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Film,
  Heart,
  RefreshCw,
  Star,
  Trash2,
  Tv,
} from "lucide-react";
import { HeartIcon, type HeartIconHandle } from "lucide-animated";

import { getCatalogDetails } from "../../api/services/catalog";
import type { CatalogItem, Like, MediaType } from "../../api/types";
import { useLikes } from "../../hooks/useLikes";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";

type Filter = "all" | MediaType;

const filterOptions: readonly { label: string; value: Filter }[] = [
  { label: "Todos", value: "all" },
  { label: "Películas", value: "movie" },
  { label: "Series", value: "series" },
];

function getLikeKey(like: Like) {
  return `${like.mediaType}:${like.externalId}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha desconocida";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function LikesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className={glassCardClass}>
          <div className="aspect-2/3 animate-pulse bg-slate-800/80" />
          <div className="flex items-center gap-2 border-t border-white/10 px-3.5 py-3">
            <div className="size-3.5 animate-pulse rounded-full bg-slate-800" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-800/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Likes() {
  const { likes, fetchLikes, removeLike, loading: likesLoading } = useLikes();
  const headerIconRef = useRef<HeartIconHandle>(null);

  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [retry, setRetry] = useState(0);

  const fetchCatalog = useCallback(async () => {
    const results = await Promise.all(
      likes.map(async (like) => {
        try {
          const item = await getCatalogDetails(like.externalId, {
            type: like.mediaType,
          });
          return [getLikeKey(like), item] as const;
        } catch (err) {
          console.error(
            `Error al obtener el contenido ${like.externalId}:`,
            err,
          );
          return null;
        }
      }),
    );

    return Object.fromEntries(
      results.filter((result) => result !== null),
    ) as Record<string, CatalogItem>;
  }, [likes]);

  useEffect(() => {
    let active = true;

    fetchLikes().catch((err) => {
      console.error("Error al consultar favoritos:", err);
      if (active) {
        setError("No fue posible cargar tus favoritos.");
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [fetchLikes, retry]);

  useEffect(() => {
    if (likesLoading.list) return;

    let active = true;

    fetchCatalog()
      .then((result) => {
        if (active) setCatalog(result);
      })
      .catch((err) => {
        console.error("Error al cargar el catálogo de favoritos:", err);
        if (active) {
          setError("No fue posible cargar los detalles de tus favoritos.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchCatalog, likesLoading.list]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRetry((current) => current + 1);
  };

  const filteredLikes = useMemo(
    () => likes.filter((like) => filter === "all" || like.mediaType === filter),
    [likes, filter],
  );

  const handleRemove = async (like: Like) => {
    const key = getLikeKey(like);
    if (removingIds.has(key)) return;

    setRemovingIds((current) => new Set(current).add(key));
    setError("");

    try {
      await removeLike(like.mediaType, like.externalId);
      setCatalog((current) => {
        const updated = { ...current };
        delete updated[key];
        return updated;
      });
    } catch (err) {
      console.error("Error al eliminar favorito:", err);
      setError("No fue posible eliminar este favorito.");
    } finally {
      setRemovingIds((current) => {
        const updated = new Set(current);
        updated.delete(key);
        return updated;
      });
    }
  };

  return (
    <PageLayout
      eyebrow="Colección personal"
      title="Mis favoritos"
      icon={<HeartIcon ref={headerIconRef} size={14} animateOnHover={false} />}
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
      action={
        !loading && (
          <div
            role="group"
            aria-label="Filtrar favoritos"
            className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
          >
            {filterOptions.map((option) => {
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={isActive}
                  className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )
      }
    >
      {error && (
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
            onClick={handleRetry}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            <RefreshCw className="size-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <LikesSkeleton />
      ) : filteredLikes.length === 0 ? (
        <div
          className={`${glassCardClass} flex flex-col items-center justify-center gap-3 px-6 py-16 text-center`}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
            <Heart className="size-6" />
          </div>

          <h2 className="text-base font-semibold text-white">
            {likes.length === 0
              ? "Todavía no tienes favoritos"
              : "No hay favoritos en esta categoría"}
          </h2>

          {likes.length > 0 && filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-1 cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              Ver todos los favoritos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {filteredLikes.map((like) => {
            const key = getLikeKey(like);
            const item = catalog[key];
            const isMovie = like.mediaType === "movie";
            const removing = removingIds.has(key);
            const title = item?.title ?? "Título no disponible";
            const href = `/${like.mediaType}/${like.externalId}`;

            return (
              <article
                key={like.id}
                className={`${glassCardClass} group flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/40 hover:shadow-[0_24px_60px_rgba(14,165,233,0.16),inset_0_1px_1px_rgba(255,255,255,0.25)]`}
              >
                <button
                  type="button"
                  onClick={() => void handleRemove(like)}
                  disabled={removing}
                  aria-label={`Quitar ${title} de favoritos`}
                  title="Quitar de favoritos"
                  className="absolute right-3 top-3 z-10 flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-slate-950/65 text-rose-400 opacity-100 backdrop-blur-xl transition-all hover:border-rose-400/50 hover:bg-rose-500 hover:text-white focus-visible:opacity-100 disabled:cursor-wait disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {removing ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>

                <Link
                  to={href}
                  aria-label={`Ver detalles de ${title}`}
                  className="flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                >
                  <div className="relative aspect-2/3 overflow-hidden bg-slate-900">
                    {item?.poster ? (
                      <img
                        src={item.poster}
                        alt={title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-3 bg-linear-to-br from-slate-800/80 to-slate-950 p-4 text-center text-slate-500">
                        {isMovie ? (
                          <Film
                            className="size-10 text-sky-400/60"
                            strokeWidth={1.4}
                          />
                        ) : (
                          <Tv
                            className="size-10 text-sky-400/60"
                            strokeWidth={1.4}
                          />
                        )}
                        <span className="text-xs">
                          Vista previa no disponible
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/25 to-transparent" />

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-xl">
                      {isMovie ? (
                        <Film className="size-3" />
                      ) : (
                        <Tv className="size-3" />
                      )}
                      {isMovie ? "Película" : "Serie"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3.5">
                      <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-sky-300 sm:text-base">
                        {title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
                        {item?.year && <span>{item.year}</span>}

                        {item?.rating != null && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {Number(item.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-2 border-t border-white/10 px-3.5 py-3 text-xs text-slate-400">
                    <CalendarDays className="size-3.5 shrink-0 text-sky-400" />
                    <span className="truncate">
                      Agregado {formatDate(like.createdAt)}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
