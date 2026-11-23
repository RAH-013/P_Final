import { useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, Check, KeyRound, Trash2, X } from "lucide-react";
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  type LockKeyholeIconHandle,
  PenToolIcon,
  type PenToolIconHandle,
  SparklesIcon,
  UserRoundCheckIcon,
  type UserRoundCheckIconHandle,
} from "lucide-animated";

import {
  deleteMyAccount,
  updateMyPassword,
  updateMyUsername,
} from "../../api/services/users";
import { useUser } from "../../contexts/UserContext";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface PasswordFieldProps {
  id: string;
  label?: string;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  danger?: boolean;
}

const inputClass =
  "h-full w-full min-w-0 bg-transparent text-sm text-white outline-none scheme-dark placeholder:text-slate-500 disabled:opacity-50 [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

const primaryButtonClass =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-sm";

const secondaryButtonClass =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm";

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

function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  disabled,
  danger,
}: PasswordFieldProps) {
  const iconRef = useRef<LockKeyholeIconHandle>(null);
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <div
        className={`group flex h-11 items-center gap-3 rounded-xl border px-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all focus-within:ring-4 ${
          danger
            ? "border-red-400/25 bg-red-950/30 focus-within:border-red-400/50 focus-within:ring-red-500/10"
            : "border-white/15 bg-slate-950/65 hover:border-white/25 focus-within:border-sky-400/60 focus-within:bg-slate-950/85 focus-within:ring-sky-500/15"
        }`}
      >
        <LockKeyholeIcon
          ref={iconRef}
          size={16}
          animateOnHover={false}
          className={`shrink-0 transition-colors ${
            danger
              ? "text-red-400"
              : "text-slate-400 group-focus-within:text-sky-400"
          }`}
        />

        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => iconRef.current?.startAnimation()}
          onBlur={() => iconRef.current?.stopAnimation()}
          disabled={disabled}
          required
          className={inputClass}
        />

        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="-mr-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, refreshUser } = useUser();

  const headerIconRef = useRef<UserRoundCheckIconHandle>(null);
  const pencilIconRef = useRef<PenToolIconHandle>(null);
  const usernameIconRef = useRef<UserRoundCheckIconHandle>(null);

  const [username, setUsername] = useState(user?.username ?? "");
  const [editingUsername, setEditingUsername] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  if (!isAuthenticated || !user) return <Navigate to="/auth" replace />;

  const currentUser = user;
  const isAdmin = currentUser.role === "admin";

  const hasValidLength =
    passwords.next.length >= 8 && passwords.next.length <= 72;
  const passwordsMatch =
    passwords.confirm.length > 0 && passwords.next === passwords.confirm;
  const isSameAsCurrent =
    passwords.current.length > 0 &&
    passwords.next.length > 0 &&
    passwords.current === passwords.next;

  function showFeedback(type: FeedbackState["type"], message: string) {
    setFeedback({ type, message });
  }

  async function handleUsernameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const normalized = username.trim();

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalized)) {
      showFeedback(
        "error",
        "Usa entre 3 y 32 caracteres: letras, números y guiones bajos.",
      );
      return;
    }

    if (normalized === currentUser.username) {
      setEditingUsername(false);
      return;
    }

    try {
      setSaving(true);
      await updateMyUsername({ username: normalized });

      const updated = await refreshUser();
      if (!updated) throw new Error("No fue posible actualizar el perfil.");

      setUsername(updated.username);
      setEditingUsername(false);
      showFeedback("success", "Nombre de usuario actualizado correctamente.");
    } catch (error) {
      showFeedback(
        "error",
        getErrorMessage(
          error,
          "No fue posible actualizar el nombre de usuario.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (passwords.next.length < 8 || passwords.next.length > 72) {
      showFeedback(
        "error",
        "La contraseña debe tener entre 8 y 72 caracteres.",
      );
      return;
    }

    if (passwords.next !== passwords.confirm) {
      showFeedback("error", "Las contraseñas nuevas no coinciden.");
      return;
    }

    if (passwords.current === passwords.next) {
      showFeedback(
        "error",
        "La nueva contraseña debe ser diferente a la actual.",
      );
      return;
    }

    try {
      setSaving(true);
      const response = await updateMyPassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswords({ current: "", next: "", confirm: "" });
      showFeedback(
        "success",
        response.message || "Contraseña actualizada correctamente.",
      );
    } catch (error) {
      showFeedback(
        "error",
        getErrorMessage(error, "No fue posible actualizar la contraseña."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deletePassword || saving) return;

    setFeedback(null);

    try {
      setSaving(true);
      await deleteMyAccount({ password: deletePassword });
      logout();
      navigate("/auth", { replace: true });
    } catch (error) {
      showFeedback(
        "error",
        getErrorMessage(error, "No fue posible eliminar tu cuenta."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout
      eyebrow="Cuenta"
      title="Mi perfil"
      icon={
        <UserRoundCheckIcon
          ref={headerIconRef}
          size={14}
          animateOnHover={false}
        />
      }
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
    >
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs backdrop-blur-xl sm:text-sm ${
            feedback.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          <span className="flex items-center gap-2.5">
            {feedback.type === "error" && (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </span>

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

      <article className={`${glassCardClass} space-y-6 p-5 sm:p-7`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border text-base font-bold shadow-inner ${
                isAdmin
                  ? "border-sky-400/35 bg-linear-to-br from-blue-600/30 to-sky-500/20 text-sky-300 shadow-white/20"
                  : "border-white/10 bg-white/5 text-slate-300 shadow-white/5"
              }`}
            >
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-bold text-white sm:text-lg">
                  {currentUser.username}
                </h2>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isAdmin
                      ? "border-sky-400/30 bg-sky-500/15 text-sky-300"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {isAdmin ? (
                    <SparklesIcon size={11} />
                  ) : (
                    <UserRoundCheckIcon size={11} />
                  )}
                  {isAdmin ? "Administrador" : "Miembro"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setEditingUsername((prev) => !prev);
                    setUsername(currentUser.username);
                    setConfirmDelete(false);
                    setDeletePassword("");
                    setFeedback(null);
                  }}
                  onMouseEnter={() => pencilIconRef.current?.startAnimation()}
                  onMouseLeave={() => pencilIconRef.current?.stopAnimation()}
                  aria-label="Editar nombre de usuario"
                  aria-expanded={editingUsername}
                  title="Editar nombre de usuario"
                  className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-sky-400/35 hover:bg-sky-500/10 hover:text-sky-300"
                >
                  <PenToolIcon
                    ref={pencilIconRef}
                    size={13}
                    animateOnHover={false}
                  />
                </button>
              </div>

              <p className="text-xs tabular-nums text-slate-400">
                ID #{currentUser.id}
              </p>
            </div>
          </div>

          {!confirmDelete && (
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true);
                setEditingUsername(false);
                setUsername(currentUser.username);
                setFeedback(null);
              }}
              className="inline-flex h-10 w-fit cursor-pointer items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-xs font-medium text-red-300 transition-all hover:border-red-400/40 hover:bg-red-500/20"
            >
              <Trash2 className="size-3.5" />
              Eliminar cuenta
            </button>
          )}
        </div>

        {editingUsername && (
          <form
            onSubmit={handleUsernameSubmit}
            className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row"
          >
            <div className="group flex h-11 flex-1 items-center gap-3 rounded-xl border border-white/15 bg-slate-950/65 px-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all hover:border-white/25 focus-within:border-sky-400/60 focus-within:bg-slate-950/85 focus-within:ring-4 focus-within:ring-sky-500/15">
              <UserRoundCheckIcon
                ref={usernameIconRef}
                size={16}
                animateOnHover={false}
                className="shrink-0 text-slate-400 transition-colors group-focus-within:text-sky-400"
              />
              <input
                id="profile-username"
                aria-label="Nuevo nombre de usuario"
                placeholder="Nuevo nombre de usuario"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => usernameIconRef.current?.startAnimation()}
                onBlur={() => usernameIconRef.current?.stopAnimation()}
                minLength={3}
                maxLength={32}
                required
                autoFocus
                disabled={saving}
                className={inputClass}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditingUsername(false);
                  setUsername(currentUser.username);
                }}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || username.trim() === currentUser.username}
                className={primaryButtonClass}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}

        {confirmDelete && (
          <form
            onSubmit={handleDeleteAccount}
            className="flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <PasswordField
                id="delete-password"
                placeholder="Confirma tu contraseña para eliminar"
                autoComplete="current-password"
                value={deletePassword}
                onChange={setDeletePassword}
                disabled={saving}
                danger
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletePassword("");
                }}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving || !deletePassword}
                className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-red-500 px-5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {saving ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </form>
        )}
      </article>

      <form
        onSubmit={handlePasswordSubmit}
        className={`${glassCardClass} space-y-6 p-5 sm:p-7`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
            <KeyRound className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white sm:text-base">
              Cambiar contraseña
            </h2>
            <p className="text-xs text-slate-400">
              Actualiza tu clave de acceso para mantener tu cuenta protegida.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="md:max-w-[calc(50%-0.5rem)]">
            <PasswordField
              id="current-password"
              label="Contraseña actual"
              placeholder="Ingresa tu contraseña actual"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(current) =>
                setPasswords((prev) => ({ ...prev, current }))
              }
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
            <PasswordField
              id="new-password"
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(next) => setPasswords((prev) => ({ ...prev, next }))}
              disabled={saving}
            />

            <PasswordField
              id="confirm-password"
              label="Confirmar nueva contraseña"
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(confirm) =>
                setPasswords((prev) => ({ ...prev, confirm }))
              }
              disabled={saving}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 transition-colors ${
                hasValidLength
                  ? "text-emerald-400"
                  : passwords.next.length > 0
                    ? "text-amber-300"
                    : "text-slate-400"
              }`}
            >
              <Check className="size-3.5 shrink-0" />
              Entre 8 y 72 caracteres
            </span>

            {passwords.confirm.length > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  passwordsMatch ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {passwordsMatch ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <X className="size-3.5 shrink-0" />
                )}
                {passwordsMatch
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </span>
            )}

            {isSameAsCurrent && (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="size-3.5 shrink-0" />
                Debe ser diferente a la contraseña actual
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={
              saving ||
              !passwords.current ||
              !passwords.next ||
              !passwords.confirm
            }
            className={`${primaryButtonClass} w-full sm:w-auto`}
          >
            {saving ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}
