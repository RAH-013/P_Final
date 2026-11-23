import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  CheckIcon,
  MessageSquareIcon,
  type MessageSquareIconHandle,
  SearchIcon,
  type SearchIconHandle,
  XIcon,
} from "lucide-animated";
import {
  AlertCircle,
  CalendarDays,
  Clapperboard,
  Film,
  MessageSquare,
  Pencil,
  RefreshCw,
  Trash2,
  Tv,
} from "lucide-react";

import { getCatalogDetails } from "../../api/services/catalog";
import type { Comment } from "../../api/types";
import { useUser } from "../../contexts/UserContext";
import { useComments } from "../../hooks/useComments";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";

type MediaFilter = "all" | Comment["mediaType"];

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface MediaPreview {
  title: string;
  poster: string | null;
}

const mediaFilters: readonly { label: string; value: MediaFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Películas", value: "movie" },
  { label: "Series", value: "series" },
];

function getMediaKey(externalId: string, mediaType: string) {
  return `${mediaType}:${externalId}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;

    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;

      if (data && typeof data === "object") {
        if ("message" in data && typeof data.message === "string") {
          return data.message;
        }

        if ("error" in data && typeof data.error === "string") {
          return data.error;
        }
      }
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CommentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className={`${glassCardClass} flex min-h-24 items-center gap-4 p-5`}
          >
            <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800/80" />
              <div className="h-7 w-12 animate-pulse rounded-lg bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-800/80 sm:max-w-xs" />
        <div className="h-11 w-60 animate-pulse rounded-xl bg-slate-800/80" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`${glassCardClass} space-y-4 p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-20 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-800" />
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-800/80" />
                </div>
              </div>
              <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800/80" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-800/80" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-800/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  media: MediaPreview | undefined;
  canEdit: boolean;
  canDelete: boolean;
  editing: boolean;
  deleting: boolean;
  saving: boolean;
  confirmingDelete: boolean;
  draft: string;
  onEdit: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

function CommentCard({
  comment,
  media,
  canEdit,
  canDelete,
  editing,
  deleting,
  saving,
  confirmingDelete,
  draft,
  onEdit,
  onDraftChange,
  onSave,
  onCancelEdit,
  onRequestDelete,
  onCancelDelete,
  onDelete,
}: CommentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isMovie = comment.mediaType === "movie";
  const MediaIcon = isMovie ? Film : Tv;
  const canExpand = comment.content.length > 220;
  const mediaTitle = media?.title || comment.externalId;

  return (
    <article
      className={`${glassCardClass} space-y-4 p-5 transition-all duration-300 hover:border-white/25`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <Link
            to={`/${comment.mediaType}/${comment.externalId}`}
            className="group relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 shadow-[0_10px_25px_rgba(0,0,0,0.4)] sm:w-16"
          >
            {media?.poster ? (
              <img
                src={media.poster}
                alt={`Póster de ${mediaTitle}`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-slate-800/80 to-slate-950 text-sky-400/60">
                <Clapperboard size={22} strokeWidth={1.5} />
              </div>
            )}
          </Link>

          <div className="min-w-0 space-y-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                isMovie
                  ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-300"
                  : "border-sky-400/30 bg-sky-500/15 text-sky-300"
              }`}
            >
              <MediaIcon className="size-3" />
              {isMovie ? "Película" : "Serie"}
            </span>

            <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">
              <Link
                to={`/${comment.mediaType}/${comment.externalId}`}
                className="transition-colors hover:text-sky-300"
              >
                {mediaTitle}
              </Link>
            </h2>

            <p className="truncate text-xs tabular-nums text-slate-400">
              ID #{comment.externalId}
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="size-3.5 text-sky-400/80" />
          {formatDate(comment.createdAt)}
        </span>
      </div>

      <div className="space-y-2.5">
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              maxLength={500}
              rows={4}
              autoFocus
              aria-label="Editar comentario"
              className="w-full resize-y rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-4 focus:ring-sky-500/10"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs tabular-nums text-slate-400">
                {draft.length}/500 caracteres
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={saving}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XIcon size={14} />
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  disabled={
                    saving || !draft.trim() || draft.trim() === comment.content
                  }
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-4 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  <CheckIcon size={14} />
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-slate-200 ${
                expanded ? "" : "line-clamp-4"
              }`}
            >
              {comment.content}
            </p>

            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="cursor-pointer text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300"
              >
                {expanded ? "Mostrar menos" : "Leer comentario completo"}
              </button>
            )}
          </>
        )}
      </div>

      {!editing && (canEdit || canDelete) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-300 transition-all hover:border-sky-400/35 hover:bg-sky-500/10 hover:text-sky-300"
              >
                <Pencil size={13} />
                Editar
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={onRequestDelete}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 text-xs font-medium text-red-300 transition-all hover:border-red-400/40 hover:bg-red-500/20"
              >
                <Trash2 size={13} />
                Eliminar
              </button>
            )}
          </div>

          {confirmingDelete && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3.5 py-2">
              <span className="text-xs font-medium text-red-200">
                ¿Eliminar comentario?
              </span>

              <button
                type="button"
                onClick={onCancelDelete}
                disabled={deleting}
                className="h-8 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="h-8 cursor-pointer rounded-xl bg-red-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function Comments() {
  const context = useUser();
  const { userId } = useParams();

  const headerIconRef = useRef<MessageSquareIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);

  const {
    comments,
    fetchCommentsByUser,
    editComment,
    removeComment,
    loading,
    error,
  } = useComments();

  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [query, setQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [mediaDetails, setMediaDetails] = useState<
    Record<string, MediaPreview>
  >({});

  const mediaCache = useRef(new Map<string, MediaPreview>());

  const isAdmin = Boolean(context.isAdmin);
  const currentUserId = context.user?.id;
  const isAdminView = userId !== undefined;
  const parsedUserId = userId === undefined ? null : Number(userId);

  const targetUserId = isAdminView ? parsedUserId : currentUserId;

  const loadComments = useCallback(async () => {
    if (
      !targetUserId ||
      !Number.isSafeInteger(targetUserId) ||
      targetUserId <= 0
    ) {
      return;
    }

    setPageError(null);

    try {
      await fetchCommentsByUser(targetUserId);
    } catch (err) {
      setPageError(
        getErrorMessage(err, "No fue posible cargar los comentarios."),
      );
    }
  }, [targetUserId, fetchCommentsByUser]);

  useEffect(() => {
    if (
      !targetUserId ||
      !Number.isSafeInteger(targetUserId) ||
      targetUserId <= 0
    ) {
      return;
    }

    let active = true;

    Promise.resolve().then(async () => {
      if (!active) return;

      try {
        await fetchCommentsByUser(targetUserId);

        if (active) {
          setPageError(null);
        }
      } catch (err) {
        if (active) {
          setPageError(
            getErrorMessage(err, "No fue posible cargar los comentarios."),
          );
        }
      }
    });

    return () => {
      active = false;
    };
  }, [targetUserId, fetchCommentsByUser]);

  const mediaItems = useMemo(() => {
    const unique = new Map<
      string,
      { externalId: string; mediaType: Comment["mediaType"] }
    >();

    for (const comment of comments) {
      const key = getMediaKey(comment.externalId, comment.mediaType);

      if (!unique.has(key)) {
        unique.set(key, {
          externalId: comment.externalId,
          mediaType: comment.mediaType,
        });
      }
    }

    return Array.from(unique.entries()).map(([key, item]) => ({
      key,
      ...item,
    }));
  }, [comments]);

  useEffect(() => {
    let active = true;

    const missingItems = mediaItems.filter(
      (item) => !mediaCache.current.has(item.key),
    );

    if (!missingItems.length) return;

    const loadMediaDetails = async () => {
      const results = await Promise.all(
        missingItems.map(async (item) => {
          try {
            const details = await getCatalogDetails(item.externalId, {
              type: item.mediaType,
            });

            return {
              key: item.key,
              details: {
                title: details.title || item.externalId,
                poster: details.poster || null,
              },
            };
          } catch {
            return {
              key: item.key,
              details: {
                title: item.externalId,
                poster: null,
              },
            };
          }
        }),
      );

      if (!active) return;

      const resolved: Record<string, MediaPreview> = {};

      for (const result of results) {
        mediaCache.current.set(result.key, result.details);
        resolved[result.key] = result.details;
      }

      setMediaDetails((previous) => ({
        ...previous,
        ...resolved,
      }));
    };

    void loadMediaDetails();

    return () => {
      active = false;
    };
  }, [mediaItems]);

  const filteredComments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return comments.filter(
      (comment) =>
        (mediaFilter === "all" || comment.mediaType === mediaFilter) &&
        (!search ||
          comment.content.toLowerCase().includes(search) ||
          comment.externalId.toLowerCase().includes(search) ||
          (mediaDetails[
            getMediaKey(comment.externalId, comment.mediaType)
          ]?.title
            .toLowerCase()
            .includes(search) ??
            false)),
    );
  }, [comments, query, mediaFilter, mediaDetails]);

  const stats = useMemo(() => {
    const movies = comments.filter(
      (comment) => comment.mediaType === "movie",
    ).length;

    return {
      total: comments.length,
      movies,
      series: comments.length - movies,
    };
  }, [comments]);

  function startEditing(comment: Comment) {
    setFeedback(null);
    setEditingId(comment.id);
    setDraft(comment.content);
    setConfirmDeleteId(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft("");
  }

  async function handleSave(comment: Comment) {
    const content = draft.trim();

    if (!content || content === comment.content || savingId !== null) return;

    setFeedback(null);

    try {
      setSavingId(comment.id);
      await editComment(comment.id, content);
      cancelEditing();

      setFeedback({
        type: "success",
        message: "Tu comentario se actualizó correctamente.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          "No fue posible actualizar el comentario.",
        ),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(comment: Comment) {
    if (deletingId !== null) return;

    setFeedback(null);

    try {
      setDeletingId(comment.id);
      await removeComment(comment.id);

      setConfirmDeleteId(null);

      setFeedback({
        type: "success",
        message: "El comentario se eliminó correctamente.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "No fue posible eliminar el comentario."),
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (!context.loading && !context.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!context.loading && isAdminView && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (
    !context.loading &&
    (!targetUserId || !Number.isSafeInteger(targetUserId) || targetUserId <= 0)
  ) {
    return <Navigate to="/" replace />;
  }

  const isLoading = context.loading || loading;

  return (
    <PageLayout
      eyebrow={isAdminView ? `Usuario #${targetUserId}` : "Actividad"}
      title={isAdminView ? "Comentarios del usuario" : "Mis comentarios"}
      icon={
        <MessageSquareIcon
          ref={headerIconRef}
          size={14}
          animateOnHover={false}
        />
      }
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
    >
      {isLoading ? (
        <CommentsSkeleton />
      ) : pageError || error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
        >
          <span className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{pageError || error}</span>
          </span>

          <button
            type="button"
            onClick={() => void loadComments()}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            <RefreshCw className="size-3.5" />
            Reintentar
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <MessageSquare className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Total de comentarios
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {stats.total}
                </p>
              </div>
            </div>

            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                <Film className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Películas</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {stats.movies}
                </p>
              </div>
            </div>

            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-300">
                <Tv className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Series</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {stats.series}
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div
              onMouseEnter={() => searchIconRef.current?.startAnimation()}
              onMouseLeave={() => searchIconRef.current?.stopAnimation()}
              className="flex h-11 w-full items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/45 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl transition-all focus-within:border-sky-400/50 focus-within:ring-4 focus-within:ring-sky-500/10 sm:max-w-xs"
            >
              <SearchIcon
                ref={searchIconRef}
                size={17}
                animateOnHover={false}
                className="shrink-0 text-slate-400"
              />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar título o comentario..."
                aria-label="Buscar comentarios"
                className="h-full w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="cursor-pointer text-base leading-none text-slate-400 transition-colors hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Filtrar por tipo"
              className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
            >
              {mediaFilters.map((option) => {
                const isActive = mediaFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMediaFilter(option.value)}
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
          </div>

          {feedback && (
            <div
              role="alert"
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs backdrop-blur-xl sm:text-sm ${
                feedback.type === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/20 bg-red-400/10 text-red-300"
              }`}
            >
              <span>{feedback.message}</span>

              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="Cerrar aviso"
                className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {!filteredComments.length ? (
            <div
              className={`${glassCardClass} flex flex-col items-center justify-center gap-3 px-6 py-16 text-center`}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <MessageSquare className="size-6" />
              </div>

              <h2 className="text-base font-semibold text-white">
                {comments.length
                  ? "No se encontraron comentarios"
                  : "Todavía no hay comentarios"}
              </h2>

              {(query || mediaFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMediaFilter("all");
                  }}
                  className="mt-1 cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => {
                const canEdit = comment.userId === currentUserId;
                const canDelete = canEdit || isAdmin;
                const mediaKey = getMediaKey(
                  comment.externalId,
                  comment.mediaType,
                );

                return (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    media={mediaDetails[mediaKey]}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    editing={editingId === comment.id}
                    deleting={deletingId === comment.id}
                    saving={savingId === comment.id}
                    confirmingDelete={confirmDeleteId === comment.id}
                    draft={draft}
                    onEdit={() => startEditing(comment)}
                    onDraftChange={setDraft}
                    onSave={() => void handleSave(comment)}
                    onCancelEdit={cancelEditing}
                    onRequestDelete={() => {
                      setConfirmDeleteId(comment.id);
                      setEditingId(null);
                      setDraft("");
                    }}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                    onDelete={() => void handleDelete(comment)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
