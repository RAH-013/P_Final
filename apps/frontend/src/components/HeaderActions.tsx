import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import {
  LogoutIcon,
  type LogoutIconHandle,
  UserIcon,
  type UserIconHandle,
} from "lucide-animated";

import { useUser } from "../contexts/UserContext";

interface LogoutConfirmModalProps {
  open: boolean;
  username: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutConfirmModal({
  open,
  username,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmIconRef = useRef<LogoutIconHandle>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-description"
      onClick={onCancel}
      style={{ animation: "modalBackdropFade 200ms ease-out" }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <style>{`
        @keyframes modalBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalDialogEnter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          animation: "modalDialogEnter 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-slate-900/85 p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-red-400/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 size-44 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl"
        />

        <div className="relative space-y-5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-red-400/30 bg-linear-to-b from-red-500/20 to-red-500/5 text-red-400 shadow-[0_12px_30px_-6px_rgba(239,68,68,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <LogOut className="size-6" />
          </div>

          <div className="space-y-2.5">
            <h2
              id="logout-modal-title"
              className="text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              ¿Cerrar sesión?
            </h2>

            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
              <User className="size-3.5 shrink-0 text-sky-400" />
              <span className="truncate">{username}</span>
            </div>

            <p
              id="logout-modal-description"
              className="text-xs leading-relaxed text-slate-400 sm:text-sm"
            >
              Tendrás que iniciar sesión nuevamente para acceder a tus favoritos
              y comentarios.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-5">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-slate-200 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:text-sm"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              onMouseEnter={() => confirmIconRef.current?.startAnimation()}
              onMouseLeave={() => confirmIconRef.current?.stopAnimation()}
              onFocus={() => confirmIconRef.current?.startAnimation()}
              onBlur={() => confirmIconRef.current?.stopAnimation()}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-rose-500 px-4 text-xs font-semibold text-white shadow-[0_10px_25px_-5px_rgba(244,63,94,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:text-sm"
            >
              <LogoutIcon
                ref={confirmIconRef}
                size={15}
                animateOnHover={false}
              />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function HeaderActions() {
  const context = useUser();
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const profileRef = useRef<UserIconHandle>(null);
  const loginRef = useRef<UserIconHandle>(null);
  const logoutRef = useRef<LogoutIconHandle>(null);

  if (!context) {
    throw new Error("HeaderActions debe utilizarse dentro de UserProvider");
  }

  const { isAuthenticated, user, logout } = context;

  const handleCloseModal = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    setConfirmOpen(false);
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);

  return (
    <>
      <nav
        aria-label="Acciones de usuario"
        className="flex shrink-0 items-center gap-2 sm:gap-2.5"
      >
        {isAuthenticated && user ? (
          <>
            <Link
              to="/profile"
              aria-label={`Perfil de ${user.username}`}
              onMouseEnter={() => profileRef.current?.startAnimation()}
              onMouseLeave={() => profileRef.current?.stopAnimation()}
              onFocus={() => profileRef.current?.startAnimation()}
              onBlur={() => profileRef.current?.stopAnimation()}
              className="group flex h-10 max-w-48 items-center gap-2.5 rounded-xl border border-white/15 bg-slate-900/50 pl-1.5 pr-3.5 text-xs font-semibold text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all duration-200 hover:border-sky-400/40 hover:bg-slate-800/70 hover:text-white hover:shadow-[0_8px_24px_-6px_rgba(56,189,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:text-sm"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-sky-400/25 bg-sky-500/15 text-sky-400 transition-colors duration-200 group-hover:border-sky-400/40 group-hover:bg-sky-500/25 group-hover:text-sky-300">
                <UserIcon ref={profileRef} size={15} animateOnHover={false} />
              </span>

              <span className="truncate">{user.username}</span>
            </Link>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              onMouseEnter={() => logoutRef.current?.startAnimation()}
              onMouseLeave={() => logoutRef.current?.stopAnimation()}
              onFocus={() => logoutRef.current?.startAnimation()}
              onBlur={() => logoutRef.current?.stopAnimation()}
              aria-label="Cerrar sesión"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/15 px-3 text-xs font-semibold text-red-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-200 hover:border-red-400/45 hover:bg-red-500/25 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:px-3.5 sm:text-sm"
            >
              <LogoutIcon ref={logoutRef} size={16} animateOnHover={false} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            onMouseEnter={() => loginRef.current?.startAnimation()}
            onMouseLeave={() => loginRef.current?.stopAnimation()}
            onFocus={() => loginRef.current?.startAnimation()}
            onBlur={() => loginRef.current?.stopAnimation()}
            className="flex h-10 items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-3.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:px-4 sm:text-sm"
          >
            <UserIcon ref={loginRef} size={16} animateOnHover={false} />
            <span>Autenticarse</span>
          </Link>
        )}
      </nav>

      {isAuthenticated && user && (
        <LogoutConfirmModal
          open={confirmOpen}
          username={user.username}
          onCancel={handleCloseModal}
          onConfirm={handleConfirmLogout}
        />
      )}
    </>
  );
}
