import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clapperboard,
  Film,
  Heart,
  MessageSquare,
  Star,
  Tv,
  X,
} from "lucide-react";
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  type LockKeyholeIconHandle,
  UserRoundCheckIcon,
  type UserRoundCheckIconHandle,
} from "lucide-animated";

import { useUser } from "../contexts/UserContext";

type AuthMode = "login" | "register";

const authTabs: readonly { label: string; value: AuthMode }[] = [
  { label: "Iniciar sesión", value: "login" },
  { label: "Crear cuenta", value: "register" },
];

const secondaryHighlights = [
  {
    icon: Heart,
    title: "Favoritos",
    description: "Tus títulos guardados siempre a mano.",
  },
  {
    icon: MessageSquare,
    title: "Comunidad",
    description: "Reseñas y recomendaciones reales.",
  },
] as const;

const glassCardClass =
  "relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/50 shadow-[0_25px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150";

const fieldWrapperClass =
  "group flex h-10 items-center gap-3 rounded-xl border border-white/15 bg-slate-950/65 px-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all hover:border-white/25 focus-within:border-sky-400/60 focus-within:bg-slate-950/85 focus-within:ring-4 focus-within:ring-sky-500/15 sm:h-11";

const inputClass =
  "h-full w-full min-w-0 bg-transparent text-sm text-white outline-none scheme-dark placeholder:text-slate-500 disabled:opacity-50 [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

const labelClass = "text-xs font-medium text-slate-300";

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

export default function Auth() {
  const context = useUser();
  const navigate = useNavigate();

  const userIconRef = useRef<UserRoundCheckIconHandle>(null);
  const passwordIconRef = useRef<LockKeyholeIconHandle>(null);
  const confirmIconRef = useRef<LockKeyholeIconHandle>(null);

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
  const normalizedUsername = username.trim();

  const isUsernameValid = /^[a-zA-Z0-9_]{3,32}$/.test(normalizedUsername);
  const isPasswordValid = password.length >= 8 && password.length <= 72;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

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

    if (!isUsernameValid) {
      setError(
        "El usuario debe tener entre 3 y 32 caracteres y solo puede contener letras, números y guiones bajos.",
      );
      return;
    }

    if (!isPasswordValid) {
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
      setError(getErrorMessage(err, "No fue posible completar la operación."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-dvh w-full overflow-x-hidden bg-slate-950 text-white lg:h-dvh lg:grid-cols-12 lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 size-128 rounded-full bg-sky-500/15 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-128 rounded-full bg-blue-600/15 blur-[150px]"
      />

      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-linear-to-br from-slate-900/95 via-slate-950 to-slate-950 p-7 xl:p-11 lg:col-span-6 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.18),transparent_52%),radial-gradient(circle_at_85%_85%,rgba(37,99,235,0.16),transparent_50%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_center,black_45%,transparent_82%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-16 right-0 w-px bg-linear-to-b from-transparent via-sky-400/40 to-transparent"
        />

        <div className="relative flex h-10 items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-4 text-xs font-medium leading-none text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-200 hover:border-sky-400/40 hover:bg-white/10 hover:text-white hover:shadow-[0_8px_24px_-6px_rgba(56,189,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <ArrowLeft className="size-3.5 shrink-0 text-sky-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Volver al inicio</span>
          </Link>

          <div className="flex h-10 items-center">
            <img
              src="/logo.png"
              alt="Logotipo de Nexus"
              className="h-9 w-auto object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] xl:h-10"
            />
          </div>
        </div>

        <div className="relative my-auto max-w-xl space-y-5 xl:space-y-6">
          <div className="space-y-2.5">
            <h2 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-[2.5rem]">
              Tu universo de
              <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                cine y series
              </span>
              en un solo lugar.
            </h2>

            <p className="max-w-md text-sm leading-relaxed text-slate-300/85 xl:text-base">
              Explora estrenos, guarda tus favoritos y comparte opiniones.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="group relative col-span-2 overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-slate-900/75 via-slate-900/50 to-sky-950/30 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-[0_22px_45px_-10px_rgba(14,165,233,0.24),inset_0_1px_1px_rgba(255,255,255,0.24)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-sky-400/60 to-transparent"
              />

              <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-linear-to-br from-blue-600/25 to-sky-500/15 text-sky-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <Clapperboard className="size-4.5" />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">
                      Catálogo curado
                    </p>
                    <p className="text-xs text-slate-300/80">
                      Fichas completas, sinopsis y reparto.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                    <Film className="size-3 text-sky-400" />
                    Cine
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                    <Tv className="size-3 text-sky-400" />
                    Series
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    Top
                  </span>
                </div>
              </div>
            </div>

            {secondaryHighlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-white/12 bg-slate-900/45 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/35 hover:bg-slate-900/65 hover:shadow-[0_18px_40px_-10px_rgba(14,165,233,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-sky-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-linear-to-br from-blue-600/20 to-sky-500/10 text-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-colors duration-300 group-hover:border-sky-400/45 group-hover:text-sky-300">
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-semibold text-white transition-colors group-hover:text-sky-100 xl:text-sm">
                    {title}
                  </p>
                  <p className="text-xs leading-snug text-slate-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]">
            Nexus
          </span>
          <span className="text-slate-500">Descubre. Explora. Disfruta.</span>
        </div>
      </aside>

      <section className="relative flex min-h-dvh w-full flex-col justify-between px-5 py-4 sm:px-8 lg:col-span-6 lg:h-dvh lg:min-h-0 lg:justify-center lg:overflow-hidden lg:py-6">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 lg:hidden">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sky-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Inicio</span>
          </Link>

          <Link to="/" aria-label="Ir al inicio de Nexus">
            <img
              src="/logo.png"
              alt="Logotipo de Nexus"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-4 lg:py-0">
          <div className={`${glassCardClass} p-5 sm:p-7`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-sky-400/50 to-transparent"
            />

            <div className="mb-4 space-y-4 sm:mb-5">
              <div
                role="tablist"
                aria-label="Modo de autenticación"
                className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1"
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
                      className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed sm:text-sm ${
                        active
                          ? "bg-linear-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/25"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {tabLabel}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo"}
                </h1>
                <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {isRegister
                    ? "Regístrate para guardar favoritos y comentar en el catálogo."
                    : "Ingresa tus credenciales para acceder a tu cuenta."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="username" className={labelClass}>
                    Nombre de usuario
                  </label>
                  {isRegister && (
                    <span className="text-[11px] text-slate-500">
                      3–32 caracteres
                    </span>
                  )}
                </div>

                <div
                  className={fieldWrapperClass}
                  onMouseEnter={() => userIconRef.current?.startAnimation()}
                  onMouseLeave={() => userIconRef.current?.stopAnimation()}
                >
                  <UserRoundCheckIcon
                    ref={userIconRef}
                    size={17}
                    animateOnHover={false}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-sky-400"
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="password" className={labelClass}>
                    Contraseña
                  </label>
                  {isRegister && (
                    <span className="text-[11px] text-slate-500">
                      Mínimo 8 caracteres
                    </span>
                  )}
                </div>

                <div
                  className={fieldWrapperClass}
                  onMouseEnter={() => passwordIconRef.current?.startAnimation()}
                  onMouseLeave={() => passwordIconRef.current?.stopAnimation()}
                >
                  <LockKeyholeIcon
                    ref={passwordIconRef}
                    size={17}
                    animateOnHover={false}
                    className="shrink-0 text-slate-400 transition-colors group-focus-within:text-sky-400"
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
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    title={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="-mr-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOffIcon size={16} />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                  </button>
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirmar contraseña
                    </label>

                    <div
                      className={fieldWrapperClass}
                      onMouseEnter={() =>
                        confirmIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() =>
                        confirmIconRef.current?.stopAnimation()
                      }
                    >
                      <LockKeyholeIcon
                        ref={confirmIconRef}
                        size={17}
                        animateOnHover={false}
                        className="shrink-0 text-slate-400 transition-colors group-focus-within:text-sky-400"
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
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        disabled={loading}
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmación"
                            : "Mostrar confirmación"
                        }
                        title={
                          showConfirmPassword
                            ? "Ocultar confirmación"
                            : "Mostrar confirmación"
                        }
                        className="-mr-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon size={16} />
                        ) : (
                          <EyeIcon size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 transition-colors ${
                        isUsernameValid
                          ? "text-emerald-400"
                          : normalizedUsername.length > 0
                            ? "text-amber-300"
                            : "text-slate-400"
                      }`}
                    >
                      <Check className="size-3.5 shrink-0" />
                      Usuario válido
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 transition-colors ${
                        isPasswordValid
                          ? "text-emerald-400"
                          : password.length > 0
                            ? "text-amber-300"
                            : "text-slate-400"
                      }`}
                    >
                      <Check className="size-3.5 shrink-0" />
                      8–72 caracteres
                    </span>

                    {confirmPassword.length > 0 && (
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
                        {passwordsMatch ? "Coinciden" : "No coinciden"}
                      </span>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2 text-xs text-red-300"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_10px_25px_-4px_rgba(14,165,233,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              >
                {loading && (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                <span>
                  {loading
                    ? "Procesando..."
                    : isRegister
                      ? "Crear cuenta"
                      : "Iniciar sesión"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
