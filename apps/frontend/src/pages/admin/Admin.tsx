import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  AlertCircle,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  SearchIcon,
  type SearchIconHandle,
  SparklesIcon,
  UserRoundCheckIcon,
  UsersIcon,
  type UsersIconHandle,
} from "lucide-animated";

import { deleteUser, getUsers, updateUserRole } from "../../api/services/users";
import type { User, UserRole } from "../../api/types";
import { useUser } from "../../contexts/UserContext";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";

type RoleFilter = "all" | UserRole;

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const roleFilters: readonly { label: string; value: RoleFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Administradores", value: "admin" },
  { label: "Miembros", value: "user" },
];

function normalizeUsers(response: unknown): User[] {
  if (Array.isArray(response)) return response as User[];

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>;
    const users = record.users ?? record.items;
    if (Array.isArray(users)) return users as User[];
  }

  throw new Error("Formato de lista de usuarios inválido.");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;

    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;

      if (data && typeof data === "object" && "message" in data) {
        if (typeof data.message === "string") return data.message;
      }
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function AdminSkeleton() {
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
        <div className="h-11 w-64 animate-pulse rounded-xl bg-slate-800/80" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`${glassCardClass} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}
          >
            <div className="flex items-center gap-3.5">
              <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-800/80" />
              </div>
            </div>
            <div className="h-9 w-56 animate-pulse rounded-xl bg-slate-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const context = useUser();
  const searchIconRef = useRef<SearchIconHandle>(null);
  const headerIconRef = useRef<UsersIconHandle>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isAdmin = Boolean(context?.isAdmin);
  const currentUserId = context?.user?.id;

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    getUsers()
      .then((response) => {
        if (!cancelled) setUsers(normalizeUsers(response));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "No fue posible cargar los usuarios."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, retry]);

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;
    return {
      total: users.length,
      admins,
      members: users.length - admins,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter(
      (user) =>
        (roleFilter === "all" || user.role === roleFilter) &&
        (!search ||
          user.username.toLowerCase().includes(search) ||
          String(user.id).includes(search)),
    );
  }, [users, query, roleFilter]);

  if (context && !context.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (context && !context.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetry((current) => current + 1);
  };

  async function handleRoleChange(target: User, nextRole: UserRole) {
    if (
      target.role === nextRole ||
      target.id === currentUserId ||
      updatingRoleId !== null
    ) {
      return;
    }

    setFeedback(null);

    try {
      setUpdatingRoleId(target.id);
      const response = await updateUserRole(target.id, { role: nextRole });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === target.id ? { ...user, role: nextRole } : user,
        ),
      );

      setFeedback({
        type: "success",
        message:
          response.message ||
          `Rol de ${target.username} actualizado a ${
            nextRole === "admin" ? "Administrador" : "Miembro"
          }.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          `No fue posible cambiar el rol de ${target.username}.`,
        ),
      });
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function handleDeleteUser(target: User) {
    if (target.id === currentUserId || deletingId !== null) return;

    setFeedback(null);

    try {
      setDeletingId(target.id);
      const response = await deleteUser(target.id);

      setUsers((prev) => prev.filter((user) => user.id !== target.id));
      setConfirmDeleteId(null);
      setFeedback({
        type: "success",
        message:
          response.message || `La cuenta de ${target.username} fue eliminada.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          err,
          `No fue posible eliminar la cuenta de ${target.username}.`,
        ),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageLayout
      eyebrow="Administración"
      title="Gestión de cuentas"
      icon={<UsersIcon ref={headerIconRef} size={14} animateOnHover={false} />}
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
    >
      {loading && <AdminSkeleton />}

      {!loading && error && (
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

      {!loading && !error && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <Users className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Total de cuentas
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
                <ShieldCheck className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Administradores
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {stats.admins}
                </p>
              </div>
            </div>

            <div
              className={`${glassCardClass} flex items-center gap-4 p-5 transition-colors hover:border-white/25`}
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                <UserCheck className="size-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Miembros</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {stats.members}
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
                placeholder="Buscar usuario o ID..."
                aria-label="Buscar usuario o ID"
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
              aria-label="Filtrar por rol"
              className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
            >
              {roleFilters.map((option) => {
                const isActive = roleFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleFilter(option.value)}
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

          {!filteredUsers.length ? (
            <div
              className={`${glassCardClass} flex flex-col items-center justify-center gap-3 px-6 py-16 text-center`}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                <Users className="size-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white">
                  No se encontraron cuentas
                </h2>
                <p className="text-sm text-slate-400">
                  Prueba con otro término de búsqueda o cambia el filtro de rol.
                </p>
              </div>

              {(query || roleFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setRoleFilter("all");
                  }}
                  className="mt-1 cursor-pointer rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((item) => {
                const isSelf = item.id === currentUserId;
                const isItemAdmin = item.role === "admin";
                const isUpdating = updatingRoleId === item.id;
                const isDeleting = deletingId === item.id;
                const isConfirming = confirmDeleteId === item.id;

                return (
                  <article
                    key={item.id}
                    className={`${glassCardClass} p-4 transition-all duration-300 hover:border-white/25 sm:p-5`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold shadow-inner ${
                            isItemAdmin
                              ? "border-sky-400/35 bg-linear-to-br from-blue-600/30 to-sky-500/20 text-sky-300 shadow-white/20"
                              : "border-white/10 bg-white/5 text-slate-300 shadow-white/5"
                          }`}
                        >
                          {item.username.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                              {item.username}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                isItemAdmin
                                  ? "border-sky-400/30 bg-sky-500/15 text-sky-300"
                                  : "border-white/10 bg-white/5 text-slate-300"
                              }`}
                            >
                              {isItemAdmin ? (
                                <SparklesIcon size={11} />
                              ) : (
                                <UserRoundCheckIcon size={11} />
                              )}
                              {isItemAdmin ? "Administrador" : "Miembro"}
                            </span>

                            {isSelf && (
                              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                Tú
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs tabular-nums text-slate-400">
                            ID #{item.id}
                          </p>
                        </div>
                      </div>

                      {isSelf ? (
                        <Link
                          to="/profile"
                          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Gestionar desde tu perfil
                        </Link>
                      ) : isConfirming ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3.5 py-2">
                          <span className="text-xs font-medium text-red-200">
                            ¿Eliminar cuenta?
                          </span>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-8 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => void handleDeleteUser(item)}
                            className="h-8 cursor-pointer rounded-xl bg-red-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link
                            to={`/users/${item.id}/comments`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-300 transition-all hover:border-sky-400/35 hover:bg-sky-500/10 hover:text-sky-300"
                          >
                            <MessageSquare className="size-3.5" />
                            Comentarios
                          </Link>

                          <div
                            role="group"
                            aria-label={`Rol de ${item.username}`}
                            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
                          >
                            {(["user", "admin"] as UserRole[]).map((role) => {
                              const isCurrentRole = item.role === role;

                              return (
                                <button
                                  key={role}
                                  type="button"
                                  disabled={isUpdating || isDeleting}
                                  onClick={() =>
                                    void handleRoleChange(item, role)
                                  }
                                  className={`h-7 cursor-pointer rounded-lg px-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isCurrentRole
                                      ? role === "admin"
                                        ? "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-sky-500/25"
                                        : "bg-white/15 text-white"
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {isUpdating && !isCurrentRole
                                    ? "..."
                                    : role === "admin"
                                      ? "Admin"
                                      : "Miembro"}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating || isDeleting}
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 text-xs font-medium text-red-300 transition-all hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="size-3.5" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
