import { useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface PasswordFieldProps {
  id: string;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  danger?: boolean;
}

const card = "rounded-2xl border border-white/10 bg-slate-900/50";
const input =
  "h-11 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50";
const button =
  "h-11 cursor-pointer rounded-xl px-4 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = `${button} bg-sky-600 text-white hover:bg-sky-500`;
const secondaryButton = `${button} border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white`;

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
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 ${
        danger
          ? "border-red-400/20 bg-red-500/5 focus-within:border-red-400/50"
          : "border-white/10 bg-white/5 focus-within:border-sky-400/50"
      }`}
    >
      <LockKeyholeIcon
        ref={iconRef}
        size={17}
        animateOnHover={false}
        className={danger ? "text-red-400" : "text-slate-400"}
      />
      <input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => iconRef.current?.startAnimation()}
        onBlur={() => iconRef.current?.stopAnimation()}
        disabled={disabled}
        required
        className={input}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="text-slate-400 hover:text-white"
      >
        {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
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

  function showFeedback(type: FeedbackState["type"], message: string) {
    setFeedback({ type, message });
  }

  async function handleUsernameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

  async function handleDeleteAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <section className="mx-auto max-w-5xl space-y-6 px-5 py-8 pb-28 md:px-8">
      <header className="space-y-2">
        <div
          className="flex items-center gap-2 text-xl font-semibold uppercase tracking-widest text-sky-400"
          onMouseEnter={() => headerIconRef.current?.startAnimation()}
          onMouseLeave={() => headerIconRef.current?.stopAnimation()}
        >
          <UserRoundCheckIcon
            ref={headerIconRef}
            size={15}
            animateOnHover={false}
          />
          Configuración de cuenta
        </div>
      </header>

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
          <button onClick={() => setFeedback(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}

      <article className={`${card} space-y-5 p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                isAdmin
                  ? "bg-sky-500/15 text-sky-300"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-semibold text-white">
                  {currentUser.username}
                </h2>
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
                  className="text-slate-400 hover:text-sky-400"
                >
                  <PenToolIcon
                    ref={pencilIconRef}
                    size={14}
                    animateOnHover={false}
                  />
                </button>
              </div>
              <span
                className={`flex items-center gap-1 text-[10px] ${
                  isAdmin ? "text-sky-300" : "text-slate-400"
                }`}
              >
                {isAdmin ? (
                  <SparklesIcon size={11} />
                ) : (
                  <UserRoundCheckIcon size={11} />
                )}
                {isAdmin ? "Administrador" : "Miembro"}
              </span>
              <p className="mt-1 text-xs text-slate-500">
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
              className={`${button} border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
            >
              Eliminar cuenta
            </button>
          )}
        </div>

        {editingUsername && (
          <form
            onSubmit={handleUsernameSubmit}
            className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row"
          >
            <div className={`${card} flex flex-1 items-center gap-3 px-4`}>
              <UserRoundCheckIcon
                ref={usernameIconRef}
                size={17}
                animateOnHover={false}
                className="text-slate-400"
              />
              <input
                id="profile-username"
                aria-label="Nuevo nombre de usuario"
                placeholder="Nuevo nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => usernameIconRef.current?.startAnimation()}
                onBlur={() => usernameIconRef.current?.stopAnimation()}
                minLength={3}
                maxLength={32}
                required
                autoFocus
                disabled={saving}
                className={input}
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
                className={secondaryButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || username.trim() === currentUser.username}
                className={primaryButton}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}

        {confirmDelete && (
          <form
            onSubmit={handleDeleteAccount}
            className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row"
          >
            <div className="flex-1">
              <PasswordField
                id="delete-password"
                placeholder="Confirma tu contraseña"
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
                className={secondaryButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !deletePassword}
                className={`${button} bg-red-500 text-white hover:bg-red-400`}
              >
                {saving ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </form>
        )}
      </article>

      <form onSubmit={handlePasswordSubmit} className={`${card} space-y-5 p-5`}>
        <div>
          <h2 className="font-semibold text-white">Cambiar contraseña</h2>
          <p className="mt-1 text-xs text-slate-400">
            Usa una contraseña segura de entre 8 y 72 caracteres.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PasswordField
            id="current-password"
            placeholder="Contraseña actual"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(current) =>
              setPasswords((prev) => ({ ...prev, current }))
            }
            disabled={saving}
          />
          <PasswordField
            id="new-password"
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(next) => setPasswords((prev) => ({ ...prev, next }))}
            disabled={saving}
          />
          <PasswordField
            id="confirm-password"
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(confirm) =>
              setPasswords((prev) => ({ ...prev, confirm }))
            }
            disabled={saving}
          />
        </div>

        <button
          type="submit"
          disabled={
            saving ||
            !passwords.current ||
            !passwords.next ||
            !passwords.confirm
          }
          className={`${primaryButton} w-full sm:ml-auto sm:w-auto`}
        >
          {saving ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </section>
  );
}
