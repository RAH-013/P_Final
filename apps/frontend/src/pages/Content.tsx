import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clapperboard,
  Clock3,
  Film,
  Globe2,
  Heart,
  Languages,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";

import { getCatalogDetails } from "../api/services/catalog";
import type { CatalogItem, MediaType } from "../api/types";
import { UserContext } from "../contexts/UserContext";
import { useLikes } from "../hooks/useLikes";
import CommentsSection from "../components/CommentsSection";

function ContentSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 pb-28">
      <div className="relative overflow-hidden border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-12 pt-10 md:flex-row md:items-end md:px-8 md:pt-16">
          <div className="aspect-2/3 w-48 shrink-0 animate-pulse rounded-3xl bg-slate-800/90 sm:w-56 md:w-64" />

          <div className="w-full space-y-5">
            <div className="flex gap-2">
              <div className="h-7 w-24 animate-pulse rounded-full bg-slate-800" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800/80" />
            </div>
            <div className="h-10 w-3/4 max-w-xl animate-pulse rounded-2xl bg-slate-800" />
            <div className="h-5 w-1/2 animate-pulse rounded-lg bg-slate-800/80" />
            <div className="flex gap-2">
              <div className="h-8 w-20 animate-pulse rounded-full bg-slate-800/80" />
              <div className="h-8 w-24 animate-pulse rounded-full bg-slate-800/80" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-slate-800/80" />
            </div>
            <div className="h-24 max-w-2xl animate-pulse rounded-2xl bg-slate-800/70" />
            <div className="h-11 w-48 animate-pulse rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 pt-8 md:px-8 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-slate-900/40" />
        <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-slate-900/40" />
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha desconocida";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-white/8 bg-white/3 p-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-400">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 space-y-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function Content() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const type = pathname.split("/")[1] as MediaType;
  const validType = type === "movie" || type === "series";

  const userContext = useContext(UserContext);
  const isAuthenticated = Boolean(userContext?.isAuthenticated);
  const authLoading = Boolean(userContext?.loading);
  const currentUserId = userContext?.user?.id
    ? Number(userContext.user.id)
    : undefined;
  const isAdmin = Boolean(userContext?.isAdmin);

  const {
    likes,
    fetchLikes,
    addLike,
    removeLike,
    loading: likesLoading,
  } = useLikes();

  const [details, setDetails] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [favoriteError, setFavoriteError] = useState("");
  const [favoriteSaving, setFavoriteSaving] = useState(false);

  const favoriteLoading = likesLoading.list;
  const favoriteCreating = likesLoading.create;
  const favoriteDeleting = likesLoading.delete;

  const favoriteBusy =
    favoriteLoading || favoriteCreating || favoriteDeleting || favoriteSaving;

  useEffect(() => {
    let active = true;

    const execute = async () => {
      if (!id || !validType) {
        setError("El contenido solicitado no es válido.");
        setDetails(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setDetails(null);

      try {
        const response = await getCatalogDetails(id, { type });

        if (active) {
          setDetails(response);
        }
      } catch (err) {
        console.error("Error al obtener los detalles:", err);

        if (active) {
          setError("No fue posible obtener los detalles del contenido.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void execute();

    return () => {
      active = false;
    };
  }, [id, type, validType, retry]);

  useEffect(() => {
    let active = true;

    const execute = async () => {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        setFavoriteError("");
        return;
      }

      setFavoriteError("");

      try {
        await fetchLikes();
      } catch (err) {
        console.error("Error al consultar favoritos:", err);

        if (active) {
          setFavoriteError("No se pudo consultar tu lista de favoritos.");
        }
      }
    };

    void execute();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, fetchLikes]);

  const isFavorite = likes.some(
    (like) => like.externalId === id && like.mediaType === type,
  );

  const handleToggleFavorite = useCallback(async () => {
    if (!id || !validType || !isAuthenticated || favoriteBusy) {
      return;
    }

    setFavoriteSaving(true);
    setFavoriteError("");

    try {
      if (isFavorite) {
        await removeLike(type, id);
      } else {
        await addLike(id, type);
      }
    } catch (err) {
      console.error("Error al actualizar favoritos:", err);

      setFavoriteError(
        isFavorite
          ? "No se pudo quitar de favoritos."
          : "No se pudo agregar a favoritos.",
      );
    } finally {
      setFavoriteSaving(false);
    }
  }, [
    id,
    validType,
    isAuthenticated,
    favoriteBusy,
    isFavorite,
    removeLike,
    addLike,
    type,
  ]);

  if (loading) {
    return <ContentSkeleton />;
  }

  if (error || !details) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="w-full space-y-4 rounded-3xl border border-red-400/15 bg-red-400/5 p-8 backdrop-blur-2xl">
          <AlertCircle className="mx-auto size-10 text-red-400" />

          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-white">
              No se pudo cargar el contenido
            </h1>
            <p className="text-sm text-slate-400">
              {error || "No se encontró información para este título."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-3.5 text-sky-400" />
              <span>Volver</span>
            </button>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isMovie = details.type === "movie";
  const MediaIcon = isMovie ? Film : Tv;

  const director = Array.isArray(details.director)
    ? details.director
    : details.director
      ? [details.director]
      : [];

  const cast = Array.isArray(details.cast) ? details.cast : [];
  const genres = Array.isArray(details.genres) ? details.genres : [];

  const glassCard =
    "relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/45 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        {details.background ? (
          <img
            src={details.background}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 -z-20 size-full scale-105 object-cover object-center opacity-45 blur-[2px]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 -z-20 size-96 rounded-full bg-sky-500/15 blur-[140px]"
          />
        )}

        <div className="absolute inset-0 -z-10 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/45" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950 via-slate-950/35 to-slate-950/50" />

        <div className="mx-auto max-w-6xl space-y-8 px-5 pb-12 pt-8 md:px-8 md:pt-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sky-400" />
            <span>Volver</span>
          </button>

          <div className="flex flex-col gap-8 md:flex-row md:items-end lg:gap-10">
            <div className="relative w-44 shrink-0 overflow-hidden rounded-3xl border border-white/20 bg-slate-900/70 shadow-[0_25px_60px_rgba(0,0,0,0.65)] sm:w-52 md:w-64">
              {details.poster ? (
                <img
                  src={details.poster}
                  alt={`Póster de ${details.title}`}
                  className="aspect-2/3 w-full object-cover"
                />
              ) : (
                <div className="flex aspect-2/3 w-full flex-col items-center justify-center gap-3 bg-linear-to-br from-slate-800 to-slate-900 p-6 text-center">
                  <MediaIcon className="size-10 text-sky-400/70" />
                  <span className="text-xs font-medium text-slate-400">
                    {details.title}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-md">
                  <MediaIcon className="size-3.5" />
                  {isMovie ? "Película" : "Serie"}
                </span>

                {details.rating != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {Number(details.rating).toFixed(1)}/10
                  </span>
                )}

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 backdrop-blur-md">
                  #{details.id}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {details.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-300 sm:text-sm">
                  {details.year && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4 text-sky-400" />
                      {details.year}
                    </span>
                  )}

                  {details.runtime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4 text-sky-400" />
                      {details.runtime}
                    </span>
                  )}

                  {details.votes != null && (
                    <span className="text-slate-400">
                      {details.votes.toLocaleString("es-MX")} votos
                    </span>
                  )}
                </div>
              </div>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/15 bg-white/6 px-3.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {details.synopsis && (
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {details.synopsis}
                </p>
              )}

              {!authLoading && isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => void handleToggleFavorite()}
                    disabled={favoriteBusy}
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                    }
                    className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                      isFavorite
                        ? "border border-rose-400/35 bg-rose-500/15 text-rose-200 shadow-[0_10px_25px_-4px_rgba(244,63,94,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-rose-400/50 hover:bg-rose-500/25"
                        : "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-[0_10px_25px_-4px_rgba(14,165,233,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-110"
                    }`}
                  >
                    <Heart
                      className={`size-4 transition-transform ${
                        isFavorite
                          ? "scale-110 fill-rose-400 text-rose-400"
                          : ""
                      }`}
                    />

                    <span>
                      {favoriteLoading
                        ? "Comprobando..."
                        : favoriteCreating || favoriteDeleting || favoriteSaving
                          ? "Actualizando..."
                          : isFavorite
                            ? "Guardado en favoritos"
                            : "Agregar a favoritos"}
                    </span>
                  </button>

                  {favoriteError && (
                    <p
                      role="alert"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-xs text-red-300"
                    >
                      <AlertCircle className="size-4 shrink-0" />
                      {favoriteError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`mx-auto grid max-w-6xl gap-6 px-5 pt-8 md:px-8 ${
          cast.length > 0 ? "lg:grid-cols-2" : ""
        }`}
      >
        <div className={`${glassCard} flex h-full flex-col space-y-5 p-6`}>
          <div className="flex min-h-7 items-center gap-2.5 border-b border-white/10 pb-4">
            <Sparkles className="size-4 text-sky-400" />
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Ficha técnica
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {director.length > 0 && (
              <InfoItem
                icon={Clapperboard}
                label={director.length > 1 ? "Directores" : "Director"}
                value={director.join(", ")}
              />
            )}

            {details.country && (
              <InfoItem icon={Globe2} label="País" value={details.country} />
            )}

            {details.language && (
              <InfoItem
                icon={Languages}
                label="Idioma"
                value={details.language}
              />
            )}

            {details.releaseDate && (
              <InfoItem
                icon={CalendarDays}
                label="Estreno"
                value={formatDate(details.releaseDate)}
              />
            )}

            {details.runtime && (
              <InfoItem
                icon={Clock3}
                label="Duración"
                value={details.runtime}
              />
            )}

            {details.votes != null && (
              <InfoItem
                icon={Star}
                label="Valoraciones"
                value={`${details.votes.toLocaleString("es-MX")} votos`}
              />
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <div className={`${glassCard} flex h-full flex-col space-y-5 p-6`}>
            <div className="flex min-h-7 items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-sky-400" />
                <h2 className="text-base font-semibold text-white sm:text-lg">
                  Reparto principal
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                {cast.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cast.map((actor, index) => (
                <div
                  key={`${actor}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition-colors hover:border-sky-400/25 hover:bg-white/6"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-linear-to-br from-blue-600/25 to-sky-500/15 text-xs font-bold tracking-wider text-sky-300">
                    {getInitials(actor)}
                  </div>

                  <span className="line-clamp-2 text-sm font-medium text-slate-200">
                    {actor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <div className={glassCard}>
          <CommentsSection
            externalId={details.id}
            mediaType={details.type}
            isAuthenticated={isAuthenticated && !authLoading}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        </div>
      </section>
    </main>
  );
}

export default Content;
