import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  UserRoundCheckIcon,
} from "lucide-animated";

import { useUser } from "../contexts/UserContext";

type AuthMode = "login" | "register";

interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const authTabs: { label: string; value: AuthMode }[] = [
  { label: "Iniciar sesión", value: "login" },
  { label: "Crear cuenta", value: "register" },
];

const card = "rounded-xl border border-white/10 bg-slate-900/60 p-6 sm:p-8";
const field =
  "group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-indigo-400/50";
const input =
  "h-11 w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60";
const button =
  "flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const primaryButton = `${button} w-full bg-indigo-500 text-white hover:bg-indigo-400`;
const label = "text-xs font-medium text-slate-300";

export default function Auth() {
  const context = useUser();
  const navigate = useNavigate();

  const userIconRef = useRef<AnimatedIconHandle>(null);
  const passwordIconRef = useRef<AnimatedIconHandle>(null);
  const confirmIconRef = useRef<AnimatedIconHandle>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!context) {
    throw new Error("Auth debe utilizarse dentro de UserProvider");
  }

  const isRegister = mode === "register";

  function changeMode(nextMode: AuthMode) {
    if (loading || nextMode === mode) return;

    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedUsername = username.trim();

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalizedUsername)) {
      setError(
        "El usuario debe tener entre 3 y 32 caracteres y solo puede contener letras, números y guiones bajos.",
      );
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("La contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const credentials = { username: normalizedUsername, password };

      if (isRegister) await context.register(credentials);
      else await context.login(credentials);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible completar la operación.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-5 py-10 text-white">
      <section className="w-full max-w-md space-y-6">
        <img
          src="/logo.png"
          alt="Logotipo de Nexus"
          className="mx-auto h-auto max-h-20 w-auto object-contain"
        />

        <div className={card}>
          <div className="mb-6 space-y-5">
            <div
              role="tablist"
              aria-label="Modo de autenticación"
              className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
            >
              {authTabs.map(({ label: tabLabel, value }) => {
                const active = mode === value;

                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={loading}
                    onClick={() => changeMode(value)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
              </h2>
              <p className="text-sm text-slate-400">
                {isRegister
                  ? "Regístrate para explorar y organizar tu contenido favorito."
                  : "Ingresa tus credenciales para acceder al catálogo."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="username" className={label}>
                  Nombre de usuario
                </label>
                {isRegister && (
                  <span className="text-[11px] text-slate-500">
                    3–32 caracteres
                  </span>
                )}
              </div>

              <div
                className={field}
                onMouseEnter={() => userIconRef.current?.startAnimation()}
                onMouseLeave={() => userIconRef.current?.stopAnimation()}
              >
                <UserRoundCheckIcon
                  ref={userIconRef}
                  size={18}
                  animateOnHover={false}
                  className="shrink-0 text-slate-400"
                />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError("");
                  }}
                  onFocus={() => userIconRef.current?.startAnimation()}
                  onBlur={() => userIconRef.current?.stopAnimation()}
                  minLength={3}
                  maxLength={32}
                  required
                  disabled={loading}
                  className={input}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className={label}>
                  Contraseña
                </label>
                {isRegister && (
                  <span className="text-[11px] text-slate-500">
                    Mínimo 8 caracteres
                  </span>
                )}
              </div>

              <div
                className={field}
                onMouseEnter={() => passwordIconRef.current?.startAnimation()}
                onMouseLeave={() => passwordIconRef.current?.stopAnimation()}
              >
                <LockKeyholeIcon
                  ref={passwordIconRef}
                  size={18}
                  animateOnHover={false}
                  className="shrink-0 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  onFocus={() => passwordIconRef.current?.startAnimation()}
                  onBlur={() => passwordIconRef.current?.stopAnimation()}
                  minLength={8}
                  maxLength={72}
                  required
                  disabled={loading}
                  className={input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-indigo-400"
                >
                  {showPassword ? (
                    <EyeOffIcon size={17} />
                  ) : (
                    <EyeIcon size={17} />
                  )}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className={label}>
                  Confirmar contraseña
                </label>

                <div
                  className={field}
                  onMouseEnter={() => confirmIconRef.current?.startAnimation()}
                  onMouseLeave={() => confirmIconRef.current?.stopAnimation()}
                >
                  <LockKeyholeIcon
                    ref={confirmIconRef}
                    size={18}
                    animateOnHover={false}
                    className="shrink-0 text-slate-400"
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (error) setError("");
                    }}
                    onFocus={() => confirmIconRef.current?.startAnimation()}
                    onBlur={() => confirmIconRef.current?.stopAnimation()}
                    minLength={8}
                    maxLength={72}
                    required
                    disabled={loading}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación"
                        : "Mostrar confirmación"
                    }
                    className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-indigo-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={17} />
                    ) : (
                      <EyeIcon size={17} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading
                ? "Procesando..."
                : isRegister
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Nexus · Descubre. Explora. Disfruta.
        </p>
      </section>
    </main>
  );
}
