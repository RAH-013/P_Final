import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Clapperboard,
  Clock3,
  Film,
  RefreshCw,
  Sparkles,
  Star,
  Tv,
} from "lucide-react";
import { SparklesIcon, type SparklesIconHandle } from "lucide-animated";

import Loader from "../../layouts/Loader";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";
import type { CatalogItem, Recommendation } from "../../api/types";
import type { RecommendationType } from "../../api/services/recommendations";
import { useRecommendations } from "../../hooks/useRecommendations";

const typeOptions: readonly {
  label: string;
  historyLabel: string;
  value: RecommendationType;
  icon: typeof Film;
}[] = [
  { label: "Ambas", historyLabel: "Todos", value: "all", icon: Clapperboard },
  { label: "Películas", historyLabel: "Películas", value: "movie", icon: Film },
  { label: "Series", historyLabel: "Series", value: "series", icon: Tv },
];

function formatDate(value: string | Date): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getMediaLabel(mediaType: Recommendation["mediaType"]): string {
  return mediaType === "movie" ? "Película" : "Serie";
}

function RecommendationsSkeleton() {
  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className={`${glassCardClass} flex min-h-24 items-center gap-4 p-5`}
          >
            <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800/80" />
              <div className="h-7 w-12 animate-pulse rounded-lg bg-slate-800" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-800" />
          <div className="h-10 w-60 animate-pulse rounded-xl bg-slate-800/80" />
        </div>

        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className={`${glassCardClass} flex min-h-76 flex-col p-4 sm:p-5`}
            >
              <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                <div className="aspect-2/3 w-full animate-pulse rounded-2xl bg-slate-800/85" />

                <div className="flex min-w-0 flex-col">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-800" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-slate-800/80" />
                  </div>

                  <div className="mt-2.5 h-11 w-4/5 animate-pulse rounded-lg bg-slate-800" />
                  <div className="mt-1 h-4 w-12 animate-pulse rounded bg-slate-800/80" />

                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-slate-800/70" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-slate-800/70" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/70" />
                  </div>

                  <div className="mt-auto pt-3">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800/80" />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex min-h-10 items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-800/80" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-800/80" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RecommendationPoster({
  item,
  mediaType,
}: {
  item: CatalogItem | null;
  mediaType: Recommendation["mediaType"];
}) {
  const MediaIcon = mediaType === "movie" ? Film : Tv;

  return (
    <div className="relative aspect-2/3 w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
      {item?.poster ? (
        <img
          src={item.poster}
          alt={`Póster de ${item.title}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-800/80 to-slate-950 p-3 text-center text-slate-500">
          <MediaIcon className="size-8 text-sky-400/60" strokeWidth={1.5} />
          <span className="text-[11px]">Sin póster</span>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onSelect,
  disabled,
}: {
  recommendation: Recommendation;
  onSelect: (id: number) => void;
  disabled: boolean;
}) {
  const item = recommendation.item;
  const isMovie = recommendation.mediaType === "movie";
  const MediaIcon = isMovie ? Film : Tv;

  return (
    <button
      type="button"
      onClick={() => onSelect(recommendation.id)}
      disabled={disabled}
      aria-label={`Ver recomendación: ${item?.title ?? "Título no disponible"}`}
      className="group h-full w-full cursor-pointer rounded-3xl text-left transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-wait disabled:opacity-60"
    >
      <article
        className={`${glassCardClass} flex h-full min-h-76 flex-col p-4 transition-all duration-300 group-hover:border-sky-400/40 group-hover:shadow-[0_24px_60px_rgba(14,165,233,0.16),inset_0_1px_1px_rgba(255,255,255,0.25)] sm:p-5`}
      >
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
          <RecommendationPoster
            item={item}
            mediaType={recommendation.mediaType}
          />

          <div className="flex min-w-0 flex-col">
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                <MediaIcon className="size-3" />
                {getMediaLabel(recommendation.mediaType)}
              </span>

              {recommendation.score !== null && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {Math.round(recommendation.score * 100)}%
                </span>
              )}
            </div>

            <h3 className="mt-2.5 min-h-11 line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-sky-300 sm:text-lg">
              {item?.title ?? "Título no disponible"}
            </h3>

            <p className="mt-1 min-h-4 text-xs font-medium text-slate-400">
              {item?.year ?? "\u00A0"}
            </p>

            <p className="mt-2.5 line-clamp-3 min-h-15 text-xs leading-relaxed text-slate-300 sm:text-sm">
              {recommendation.reason}
            </p>

            <div className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-sky-400 transition-colors group-hover:text-sky-300">
              <span>Ver recomendación</span>
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        <div className="mt-auto flex min-h-10 items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-slate-400">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 text-sky-400/80" />
            <span className="truncate">
              {formatDate(recommendation.createdAt)}
            </span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium text-slate-300">
            {recommendation.source === "gemini" && (
              <Sparkles className="size-3 text-sky-400" />
            )}
            {recommendation.source === "gemini" ? "IA Gemini" : "Local"}
          </span>
        </div>
      </article>
    </button>
  );
}

function RecommendationDetail({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const item = recommendation.item;
  const isMovie = recommendation.mediaType === "movie";
  const MediaIcon = isMovie ? Film : Tv;

  return (
    <section className={`${glassCardClass} p-5 sm:p-8`}>
      {(item?.background || item?.poster) && (
        <>
          <img
            src={item.background || item.poster || ""}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 size-full scale-110 object-cover object-center opacity-20 blur-xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-slate-950/90 via-slate-900/85 to-slate-950/95"
          />
        </>
      )}

      <div className="grid gap-7 md:grid-cols-[230px_minmax(0,1fr)] lg:gap-9">
        <div className="mx-auto w-full max-w-56 md:mx-0">
          <RecommendationPoster
            item={item}
            mediaType={recommendation.mediaType}
          />
        </div>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                <MediaIcon className="size-3.5" />
                {getMediaLabel(recommendation.mediaType)}
              </span>

              {recommendation.score !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {Math.round(recommendation.score * 100)}% afinidad
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <Sparkles className="size-3 text-sky-400" />
                {recommendation.source === "gemini"
                  ? "IA Gemini"
                  : "Algoritmo local"}
              </span>
            </div>

            {item?.id && (
              <Link
                to={`/${recommendation.mediaType}/${item.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <span>Ver ficha completa</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {item?.title ?? "Título no disponible"}
            </h2>

            {(item?.year || item?.runtime || item?.rating != null) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-400 sm:text-sm">
                {item.year && <span>{item.year}</span>}

                {item.runtime && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5 text-sky-400" />
                    {item.runtime}
                  </span>
                )}

                {item.rating != null && (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {Number(item.rating).toFixed(1)}/10
                  </span>
                )}
              </div>
            )}
          </div>

          {item?.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/15 bg-white/6 px-3.5 py-1 text-xs font-medium text-slate-200"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {item?.synopsis && (
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              {item.synopsis}
            </p>
          )}

          <div className="rounded-2xl border border-sky-400/25 bg-linear-to-br from-blue-600/15 to-sky-500/10 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-300">
              <Sparkles className="size-4 text-sky-400" />
              <span>¿Por qué te la recomendamos?</span>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-slate-100 sm:text-base">
              {recommendation.reason}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-sky-400" />
              Generada el {formatDate(recommendation.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Recommendations() {
  const { previous, fetchPrevious, fetchNext, fetchById, loading, error } =
    useRecommendations();

  const headerIconRef = useRef<SparklesIconHandle>(null);

  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [generateType, setGenerateType] = useState<RecommendationType>("all");
  const [historyFilter, setHistoryFilter] = useState<RecommendationType>("all");
  const [actionError, setActionError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const initialLoadStarted = useRef(false);

  const loadPrevious = useCallback(async () => {
    await fetchPrevious();
  }, [fetchPrevious]);

  useEffect(() => {
    if (initialLoadStarted.current) {
      return;
    }

    initialLoadStarted.current = true;
    void loadPrevious().catch(() => {});
  }, [loadPrevious]);

  const recommendations = useMemo(() => previous?.data ?? [], [previous?.data]);

  const filteredRecommendations = useMemo(
    () =>
      recommendations.filter(
        (item) => historyFilter === "all" || item.mediaType === historyFilter,
      ),
    [recommendations, historyFilter],
  );

  const handleGenerate = async () => {
    if (generating || loadingDetail || loading) {
      return;
    }

    setGenerating(true);
    setActionError("");

    try {
      const response = await fetchNext(generateType);
      setSelected(response.data);
      await fetchPrevious();
    } catch {
      setActionError(
        "No fue posible generar una recomendación. Verifica tus géneros preferidos o inténtalo nuevamente.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = async (id: number) => {
    if (loadingDetail || generating) {
      return;
    }

    setLoadingDetail(true);
    setActionError("");

    try {
      const response = await fetchById(id);
      setSelected(response.data);
    } catch {
      setActionError("No fue posible cargar el detalle de esta recomendación.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const movieCount = recommendations.filter(
    (item) => item.mediaType === "movie",
  ).length;

  const seriesCount = recommendations.filter(
    (item) => item.mediaType === "series",
  ).length;

  const isOverlayLoading = generating || loadingDetail;

  return (
    <PageLayout
      eyebrow="Recomendaciones"
      title="Descubre qué ver"
      icon={
        <SparklesIcon ref={headerIconRef} size={14} animateOnHover={false} />
      }
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
      onBack={selected ? () => setSelected(null) : undefined}
      ariaBusy={isOverlayLoading}
    >
      {isOverlayLoading && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-100 flex h-dvh w-dvw items-center justify-center overflow-hidden overscroll-none touch-none bg-slate-950/60 backdrop-blur-md transition-all duration-300 *:h-auto *:min-h-0"
        >
          <Loader />
        </div>
      )}

      {!selected && (
        <section className={`${glassCardClass} p-5 sm:p-6`}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-sky-500/15 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              ¿Qué te gustaría descubrir hoy?
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                role="group"
                aria-label="Formato a recomendar"
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
              >
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = generateType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGenerateType(option.value)}
                      aria-pressed={isActive}
                      disabled={isOverlayLoading || loading}
                      className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:text-sm ${
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

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isOverlayLoading || loading}
                className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-sm"
              >
                {generating ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {generating ? "Generando..." : "Generar recomendación"}
              </button>
            </div>
          </div>
        </section>
      )}

      {(actionError || error) && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
        >
          <span className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{actionError || error}</span>
          </span>

          {actionError && (
            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Cerrar aviso"
              className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      )}

      {selected ? (
        <RecommendationDetail recommendation={selected} />
      ) : loading && recommendations.length === 0 ? (
        <RecommendationsSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <Film className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Películas recomendadas
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {movieCount}
                </p>
              </div>
            </div>

            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                <Tv className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Series recomendadas
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {seriesCount}
                </p>
              </div>
            </div>

            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                <Sparkles className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Total en el historial
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {recommendations.length}
                </p>
              </div>
            </div>
          </section>

          {recommendations.length > 0 ? (
            <section className="space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Tu historial
                </h2>

                <div
                  role="group"
                  aria-label="Filtrar historial"
                  className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
                >
                  {typeOptions.map((option) => {
                    const isActive = historyFilter === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setHistoryFilter(option.value)}
                        aria-pressed={isActive}
                        className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                          isActive
                            ? "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {option.historyLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredRecommendations.length === 0 ? (
                <div
                  className={`${glassCardClass} flex flex-col items-center justify-center gap-3 px-6 py-14 text-center`}
                >
                  <p className="text-sm text-slate-400">
                    No hay recomendaciones en esta categoría.
                  </p>

                  <button
                    type="button"
                    onClick={() => setHistoryFilter("all")}
                    className="cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    Ver todas
                  </button>
                </div>
              ) : (
                <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredRecommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onSelect={handleSelect}
                      disabled={isOverlayLoading}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div
              className={`${glassCardClass} flex flex-col items-center px-6 py-16 text-center`}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <Clapperboard className="size-7" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-white sm:text-lg">
                Aún no tienes recomendaciones
              </h2>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isOverlayLoading || loading}
                className="mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="size-3.5" />
                Generar mi primera recomendación
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
