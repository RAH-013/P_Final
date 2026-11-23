import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <main className="relative isolate flex min-h-dvh w-full flex-col justify-between overflow-x-hidden bg-slate-950 px-5 py-6 text-white sm:px-8 lg:h-dvh lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 size-128 rounded-full bg-sky-500/15 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 -z-10 size-128 rounded-full bg-blue-600/15 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_center,black_35%,transparent_78%)]"
      />

      <header className="mx-auto flex h-10 w-full max-w-5xl items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="Ir al inicio de Nexus"
          className="flex h-10 items-center transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <img
            src="/logo.png"
            alt="Logotipo de Nexus"
            className="h-9 w-auto object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:h-10"
          />
        </Link>

        <span className="font-mono text-xs tracking-wider text-slate-500">
          HTTP / 404
        </span>
      </header>

      <section className="mx-auto my-auto grid w-full max-w-5xl items-center gap-10 py-8 lg:grid-cols-12 lg:gap-12 lg:py-0">
        <div className="min-w-0 space-y-6 text-center lg:col-span-7 lg:text-left">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3.5 py-1.5 font-mono text-xs text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <span className="size-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            <span className="truncate">{pathname}</span>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-6xl font-extrabold tracking-tighter text-white sm:text-7xl lg:text-8xl">
              4
              <span className="bg-linear-to-b from-sky-300 to-blue-500 bg-clip-text text-transparent">
                0
              </span>
              4
            </p>

            <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              No encontramos esta página
            </h1>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400 lg:mx-0 sm:text-base">
              El enlace puede estar roto, el título ya no forma parte del
              catálogo o la dirección escrita no existe.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row lg:justify-start">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-6 text-sm font-semibold text-white shadow-[0_10px_25px_-4px_rgba(14,165,233,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Compass className="size-4" />
              <span>Ir al catálogo</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/55 px-5 text-sm font-medium text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ArrowLeft className="size-4 text-sky-400 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Volver atrás</span>
            </button>
          </div>
        </div>

        <div className="hidden justify-center lg:col-span-5 lg:flex">
          <div className="group relative w-64 select-none">
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-6 rounded-3xl border border-white/10 bg-slate-900/35 backdrop-blur-md transition-transform duration-500 group-hover:-translate-x-3 group-hover:-rotate-9"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rotate-4 rounded-3xl border border-sky-400/15 bg-slate-900/45 backdrop-blur-md transition-transform duration-500 group-hover:translate-x-3 group-hover:rotate-7"
            />

            <div className="relative flex aspect-2/3 w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-[0_28px_70px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.22)] backdrop-blur-2xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.16),transparent_60%)]"
              />

              <div className="relative flex items-center justify-between font-mono text-[10px] tracking-widest text-slate-400">
                <span>NEXUS // REEL</span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-slate-300">
                  VACÍO
                </span>
              </div>

              <div className="relative my-auto flex flex-col items-center gap-3">
                <div className="relative flex size-24 items-center justify-center rounded-full border border-dashed border-white/20">
                  <div className="flex size-16 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <span className="font-mono text-xs font-bold tracking-widest text-sky-300">
                      NULL
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-slate-500">
                  00:00:00:00
                </span>
              </div>

              <div className="relative space-y-2.5 border-t border-white/10 pt-3.5">
                <div className="h-2.5 w-3/4 rounded-full bg-white/12" />
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>TÍTULO NO DISPONIBLE</span>
                  <span className="text-sky-400/80">404</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]">
          Nexus
        </span>
        <span className="text-slate-500">Descubre. Explora. Disfruta.</span>
      </footer>
    </main>
  );
}
