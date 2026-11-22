import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
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

type RoleFilter = "all" | UserRole;

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

const roleFilters: { label: string; value: RoleFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Administradores", value: "admin" },
  { label: "Miembros", value: "user" },
];

const card = "rounded-2xl border border-white/10 bg-slate-900/50";
const muted = "text-slate-400";
const input =
  "h-11 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500";
const button =
  "cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={`${card} h-24 animate-pulse`} />
        ))}
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`${card} flex items-center justify-between p-5`}
        >
          <div className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-800" />
        </div>
      ))}
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

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const response = await getUsers();
        if (!cancelled) setUsers(normalizeUsers(response));
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "No fue posible cargar los usuarios."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUsers();
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

  async function handleRoleChange(target: User, nextRole: UserRole) {
    if (
      target.role === nextRole ||
      target.id === currentUserId ||
      updatingRoleId !== null
    )
      return;

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
    <section className="mx-auto max-w-5xl space-y-6 px-5 py-8 pb-28 md:px-8">
      <header className="space-y-2">
        <div
          className="flex items-center gap-2 text-xl font-semibold uppercase tracking-widest text-sky-400"
          onMouseEnter={() => headerIconRef.current?.startAnimation()}
          onMouseLeave={() => headerIconRef.current?.stopAnimation()}
        >
          <UsersIcon ref={headerIconRef} size={15} animateOnHover={false} />
          Panel de administración
        </div>
      </header>

      {loading && <AdminSkeleton />}

      {!loading && error && (
        <div className={`${card} space-y-4 p-8 text-center`}>
          <p className="text-sm text-red-400">{error}</p>
          <button
            className={`${button} bg-white/10 text-white`}
            onClick={() => setRetry((v) => v + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Total cuentas",
                value: stats.total,
                color: "text-white",
              },
              {
                label: "Administradores",
                value: stats.admins,
                color: "text-sky-400",
              },
              {
                label: "Miembros",
                value: stats.members,
                color: "text-slate-200",
              },
            ].map((stat) => (
              <div key={stat.label} className={`${card} p-4`}>
                <p className={`text-xs ${muted}`}>{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className={`${card} flex items-center gap-3 px-4 sm:max-w-xs`}
              onMouseEnter={() => searchIconRef.current?.startAnimation()}
              onMouseLeave={() => searchIconRef.current?.stopAnimation()}
            >
              <SearchIcon
                ref={searchIconRef}
                size={18}
                animateOnHover={false}
                className={muted}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar usuario o ID..."
                aria-label="Buscar usuario o ID"
                className={input}
              />
              {query && (
                <button
                  className={muted}
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            <div className={`${card} flex w-fit gap-1 p-1`}>
              {roleFilters.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRoleFilter(option.value)}
                  aria-pressed={roleFilter === option.value}
                  className={`${button} ${
                    roleFilter === option.value
                      ? "bg-sky-600 text-white"
                      : `${muted} hover:bg-white/5 hover:text-white`
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div
              role="alert"
              className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                feedback.type === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/20 bg-red-400/10 text-red-300"
              }`}
            >
              {feedback.message}
              <button
                onClick={() => setFeedback(null)}
                aria-label="Cerrar aviso"
              >
                ×
              </button>
            </div>
          )}

          {!filteredUsers.length ? (
            <div className={`${card} p-12 text-center text-sm ${muted}`}>
              No se encontraron usuarios con ese criterio.
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
                  <article key={item.id} className={`${card} p-4`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-bold ${
                            isItemAdmin
                              ? "bg-sky-500/15 text-sky-300"
                              : "bg-white/5 text-slate-300"
                          }`}
                        >
                          {item.username.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold text-white">
                              {item.username}
                            </h2>
                            <span
                              className={`flex items-center gap-1 text-[10px] ${isItemAdmin ? "text-sky-300" : muted}`}
                            >
                              {isItemAdmin ? (
                                <SparklesIcon size={11} />
                              ) : (
                                <UserRoundCheckIcon size={11} />
                              )}
                              {isItemAdmin ? "Administrador" : "Miembro"}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] text-slate-500">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className={`mt-1 text-xs ${muted}`}>
                            ID #{item.id}
                          </p>
                        </div>
                      </div>

                      {isSelf ? (
                        <p className={`text-xs ${muted}`}>
                          Gestiona tu cuenta desde tu perfil
                        </p>
                      ) : isConfirming ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-red-300">
                            ¿Eliminar cuenta?
                          </span>
                          <button
                            className={`${button} bg-white/10 text-white`}
                            disabled={isDeleting}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            className={`${button} bg-red-500 text-white`}
                            disabled={isDeleting}
                            onClick={() => handleDeleteUser(item)}
                          >
                            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`${card} flex gap-1 p-1`}>
                            {(["user", "admin"] as UserRole[]).map((role) => (
                              <button
                                key={role}
                                disabled={isUpdating || isDeleting}
                                onClick={() => handleRoleChange(item, role)}
                                className={`${button} ${
                                  item.role === role
                                    ? role === "admin"
                                      ? "bg-sky-600 text-white"
                                      : "bg-white/15 text-white"
                                    : `${muted} hover:text-white`
                                }`}
                              >
                                {isUpdating && role === "admin"
                                  ? "..."
                                  : role === "admin"
                                    ? "Admin"
                                    : "Miembro"}
                              </button>
                            ))}
                          </div>
                          <button
                            disabled={isUpdating || isDeleting}
                            onClick={() => setConfirmDeleteId(item.id)}
                            className={`${button} border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
                          >
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
    </section>
  );
}
