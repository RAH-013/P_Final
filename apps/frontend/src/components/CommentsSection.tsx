import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  MessageSquare,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

import type { Comment, MediaType } from "../api/types";
import { useComments } from "../hooks/useComments";

interface CommentsSectionProps {
  externalId: string;
  mediaType: MediaType;
  isAuthenticated: boolean;
  currentUserId?: number;
  isAdmin: boolean;
}

interface CommentItemProps {
  comment: Comment;
  isAuthenticated: boolean;
  currentUserId?: number;
  isAdmin: boolean;
  onEdit: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const MAX_COMMENT_LENGTH = 1000;

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

function CommentItem({
  comment,
  isAuthenticated,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner =
    isAuthenticated &&
    currentUserId !== undefined &&
    comment.userId === currentUserId;

  const canEdit = isOwner;
  const canDelete = isAuthenticated && (isOwner || isAdmin);

  const handleEdit = async () => {
    const trimmedContent = content.trim();

    if (
      !canEdit ||
      !trimmedContent ||
      trimmedContent.length > MAX_COMMENT_LENGTH ||
      trimmedContent === comment.content ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onEdit(comment.id, trimmedContent);
      setEditing(false);
    } catch {
      setError("No fue posible actualizar el comentario.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onDelete(comment.id);
      setConfirmDelete(false);
    } catch {
      setError("No fue posible eliminar el comentario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/45 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:border-white/25 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${
              isOwner
                ? "border-sky-400/35 bg-linear-to-br from-blue-600/30 to-sky-500/20 text-sky-300 shadow-white/20"
                : "border-white/10 bg-white/5 text-slate-300 shadow-white/5"
            }`}
          >
            {isOwner ? (
              <Sparkles className="size-4" />
            ) : (
              <User className="size-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-sm font-semibold text-white">
                {isOwner ? "Tú" : comment.user?.username || "Usuario Nexus"}
              </strong>

              {isOwner && (
                <span className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                  Autor
                </span>
              )}
            </div>

            <time
              dateTime={String(comment.createdAt)}
              className="mt-0.5 block text-xs text-slate-400"
            >
              {formatDate(comment.createdAt)}
            </time>
          </div>
        </div>

        {!editing && !confirmDelete && (canEdit || canDelete) && (
          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setContent(comment.content);
                  setEditing(true);
                  setConfirmDelete(false);
                  setError("");
                }}
                disabled={loading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-sky-400/35 hover:bg-sky-500/10 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setError("");
                }}
                disabled={loading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-all hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/4 p-3.5 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 hover:bg-white/[0.07] focus:border-sky-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-sky-500/10 disabled:opacity-50"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {content.length}/{MAX_COMMENT_LENGTH}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setContent(comment.content);
                  setEditing(false);
                  setError("");
                }}
                disabled={loading}
                className="h-9 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  loading ||
                  !content.trim() ||
                  content.trim().length > MAX_COMMENT_LENGTH ||
                  content.trim() === comment.content
                }
                className="h-9 cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-4 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-200">
          {comment.content}
        </p>
      )}

      {confirmDelete && canDelete && (
        <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3.5 sm:flex-row sm:items-center">
          <p className="text-xs font-medium text-red-200">
            ¿Estás seguro de que deseas eliminar este comentario?
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={loading}
              className="h-8 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="h-8 cursor-pointer rounded-xl bg-red-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Eliminando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-xs text-red-300"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </article>
  );
}

export default function CommentsSection({
  externalId,
  mediaType,
  isAuthenticated,
  currentUserId,
  isAdmin,
}: CommentsSectionProps) {
  const {
    comments,
    fetchCommentsByMedia,
    addComment,
    editComment,
    removeComment,
    mediaLoading,
    mediaError,
  } = useComments();

  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    void fetchCommentsByMedia(mediaType, externalId).catch(() => {});
  }, [fetchCommentsByMedia, mediaType, externalId]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated || saving) {
      return;
    }

    const content = newComment.trim();

    if (!content || content.length > MAX_COMMENT_LENGTH) {
      return;
    }

    setSaving(true);
    setError("");
    setFeedback("");

    try {
      await addComment(externalId, mediaType, content);
      setNewComment("");
      setFeedback("Comentario publicado correctamente.");
    } catch {
      setError("No fue posible publicar el comentario.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: number, content: string) => {
    await editComment(id, content);
    setFeedback("Comentario actualizado correctamente.");
  };

  const handleDelete = async (id: number) => {
    await removeComment(id);
    setFeedback("Comentario eliminado correctamente.");
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section
      id="comments"
      className="mx-auto w-full max-w-6xl space-y-6 px-5 py-10 md:px-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
          <MessageSquare className="size-5" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Comentarios ({comments.length})
        </h2>
      </div>

      {isAuthenticated && (
        <form
          onSubmit={handleCreate}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/45 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6"
        >
          <div className="space-y-3">
            <label
              htmlFor="new-comment"
              className="block text-xs font-semibold uppercase tracking-wider text-sky-400"
            >
              Escribe un comentario
            </label>

            <textarea
              id="new-comment"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Comparte tu opinión..."
              maxLength={MAX_COMMENT_LENGTH}
              rows={4}
              disabled={saving}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/4 p-4 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-slate-500 hover:border-white/20 hover:bg-white/[0.07] focus:border-sky-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-sky-500/10 disabled:opacity-50"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              {newComment.length}/{MAX_COMMENT_LENGTH}
            </p>

            <button
              type="submit"
              disabled={
                saving ||
                !newComment.trim() ||
                newComment.trim().length > MAX_COMMENT_LENGTH
              }
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-sm"
            >
              <Send className="size-3.5" />
              {saving ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      )}

      {(error || mediaError) && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {error || mediaError}
          </span>

          {error && (
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Cerrar aviso"
              className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-300 backdrop-blur-xl sm:text-sm"
        >
          <span>{feedback}</span>

          <button
            type="button"
            onClick={() => setFeedback("")}
            aria-label="Cerrar aviso"
            className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {mediaLoading ? (
        <div className="space-y-4">
          <p className="sr-only">Cargando comentarios...</p>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 animate-pulse rounded-2xl bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-800/80" />
                </div>
              </div>
              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-800/70" />
            </div>
          ))}
        </div>
      ) : sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        !error &&
        !mediaError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-900/40 px-6 py-14 text-center backdrop-blur-2xl">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-400">
              <MessageSquare className="size-5" />
            </div>
            <p className="text-sm text-slate-400">
              Todavía no hay comentarios.
            </p>
          </div>
        )
      )}
    </section>
  );
}
