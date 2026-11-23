import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SlidersHorizontalIcon,
  type SlidersHorizontalIconHandle,
  SparklesIcon,
} from "lucide-animated";
import {
  AlertCircle,
  Baby,
  BookOpen,
  Camera,
  Clapperboard,
  Drama,
  Film,
  Flame,
  Ghost,
  Globe,
  Heart,
  Laugh,
  Mic2,
  Mountain,
  Music,
  Newspaper,
  RefreshCw,
  Rocket,
  Search,
  Shield,
  Skull,
  Sword,
  Trophy,
  Tv,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { useGenres } from "../../hooks/useGenres";
import PageLayout, { glassCardClass } from "../../layouts/PageLayout";

type GenreStyle = {
  icon: LucideIcon;
  color: string;
  selected: string;
};

const genreStyles: Record<string, GenreStyle> = {
  action: {
    icon: Flame,
    color: "text-orange-400",
    selected: "border-orange-400/50 bg-orange-500/15 shadow-orange-500/10",
  },
  acción: {
    icon: Flame,
    color: "text-orange-400",
    selected: "border-orange-400/50 bg-orange-500/15 shadow-orange-500/10",
  },
  adventure: {
    icon: Mountain,
    color: "text-emerald-400",
    selected: "border-emerald-400/50 bg-emerald-500/15 shadow-emerald-500/10",
  },
  aventura: {
    icon: Mountain,
    color: "text-emerald-400",
    selected: "border-emerald-400/50 bg-emerald-500/15 shadow-emerald-500/10",
  },
  animation: {
    icon: WandSparkles,
    color: "text-fuchsia-400",
    selected: "border-fuchsia-400/50 bg-fuchsia-500/15 shadow-fuchsia-500/10",
  },
  animación: {
    icon: WandSparkles,
    color: "text-fuchsia-400",
    selected: "border-fuchsia-400/50 bg-fuchsia-500/15 shadow-fuchsia-500/10",
  },
  biography: {
    icon: BookOpen,
    color: "text-amber-400",
    selected: "border-amber-400/50 bg-amber-500/15 shadow-amber-500/10",
  },
  biografía: {
    icon: BookOpen,
    color: "text-amber-400",
    selected: "border-amber-400/50 bg-amber-500/15 shadow-amber-500/10",
  },
  comedy: {
    icon: Laugh,
    color: "text-yellow-400",
    selected: "border-yellow-400/50 bg-yellow-500/15 shadow-yellow-500/10",
  },
  comedia: {
    icon: Laugh,
    color: "text-yellow-400",
    selected: "border-yellow-400/50 bg-yellow-500/15 shadow-yellow-500/10",
  },
  crime: {
    icon: Search,
    color: "text-slate-300",
    selected: "border-slate-400/50 bg-slate-500/15 shadow-slate-500/10",
  },
  crimen: {
    icon: Search,
    color: "text-slate-300",
    selected: "border-slate-400/50 bg-slate-500/15 shadow-slate-500/10",
  },
  documentary: {
    icon: Camera,
    color: "text-cyan-400",
    selected: "border-cyan-400/50 bg-cyan-500/15 shadow-cyan-500/10",
  },
  documental: {
    icon: Camera,
    color: "text-cyan-400",
    selected: "border-cyan-400/50 bg-cyan-500/15 shadow-cyan-500/10",
  },
  drama: {
    icon: Drama,
    color: "text-violet-400",
    selected: "border-violet-400/50 bg-violet-500/15 shadow-violet-500/10",
  },
  family: {
    icon: Baby,
    color: "text-pink-400",
    selected: "border-pink-400/50 bg-pink-500/15 shadow-pink-500/10",
  },
  familia: {
    icon: Baby,
    color: "text-pink-400",
    selected: "border-pink-400/50 bg-pink-500/15 shadow-pink-500/10",
  },
  fantasy: {
    icon: WandSparkles,
    color: "text-purple-400",
    selected: "border-purple-400/50 bg-purple-500/15 shadow-purple-500/10",
  },
  fantasía: {
    icon: WandSparkles,
    color: "text-purple-400",
    selected: "border-purple-400/50 bg-purple-500/15 shadow-purple-500/10",
  },
  "film-noir": {
    icon: Film,
    color: "text-zinc-300",
    selected: "border-zinc-400/50 bg-zinc-500/15 shadow-zinc-500/10",
  },
  horror: {
    icon: Ghost,
    color: "text-red-400",
    selected: "border-red-400/50 bg-red-500/15 shadow-red-500/10",
  },
  terror: {
    icon: Ghost,
    color: "text-red-400",
    selected: "border-red-400/50 bg-red-500/15 shadow-red-500/10",
  },
  history: {
    icon: Globe,
    color: "text-lime-400",
    selected: "border-lime-400/50 bg-lime-500/15 shadow-lime-500/10",
  },
  historia: {
    icon: Globe,
    color: "text-lime-400",
    selected: "border-lime-400/50 bg-lime-500/15 shadow-lime-500/10",
  },
  music: {
    icon: Music,
    color: "text-pink-400",
    selected: "border-pink-400/50 bg-pink-500/15 shadow-pink-500/10",
  },
  música: {
    icon: Music,
    color: "text-pink-400",
    selected: "border-pink-400/50 bg-pink-500/15 shadow-pink-500/10",
  },
  musical: {
    icon: Mic2,
    color: "text-rose-400",
    selected: "border-rose-400/50 bg-rose-500/15 shadow-rose-500/10",
  },
  mystery: {
    icon: Search,
    color: "text-indigo-400",
    selected: "border-indigo-400/50 bg-indigo-500/15 shadow-indigo-500/10",
  },
  misterio: {
    icon: Search,
    color: "text-indigo-400",
    selected: "border-indigo-400/50 bg-indigo-500/15 shadow-indigo-500/10",
  },
  news: {
    icon: Newspaper,
    color: "text-sky-400",
    selected: "border-sky-400/50 bg-sky-500/15 shadow-sky-500/10",
  },
  noticias: {
    icon: Newspaper,
    color: "text-sky-400",
    selected: "border-sky-400/50 bg-sky-500/15 shadow-sky-500/10",
  },
  reality: {
    icon: Tv,
    color: "text-teal-400",
    selected: "border-teal-400/50 bg-teal-500/15 shadow-teal-500/10",
  },
  romance: {
    icon: Heart,
    color: "text-rose-400",
    selected: "border-rose-400/50 bg-rose-500/15 shadow-rose-500/10",
  },
  "sci-fi": {
    icon: Rocket,
    color: "text-blue-400",
    selected: "border-blue-400/50 bg-blue-500/15 shadow-blue-500/10",
  },
  "ciencia ficción": {
    icon: Rocket,
    color: "text-blue-400",
    selected: "border-blue-400/50 bg-blue-500/15 shadow-blue-500/10",
  },
  sport: {
    icon: Trophy,
    color: "text-green-400",
    selected: "border-green-400/50 bg-green-500/15 shadow-green-500/10",
  },
  deporte: {
    icon: Trophy,
    color: "text-green-400",
    selected: "border-green-400/50 bg-green-500/15 shadow-green-500/10",
  },
  thriller: {
    icon: Skull,
    color: "text-rose-300",
    selected: "border-rose-300/50 bg-rose-400/15 shadow-rose-400/10",
  },
  war: {
    icon: Shield,
    color: "text-stone-400",
    selected: "border-stone-400/50 bg-stone-500/15 shadow-stone-500/10",
  },
  guerra: {
    icon: Shield,
    color: "text-stone-400",
    selected: "border-stone-400/50 bg-stone-500/15 shadow-stone-500/10",
  },
  western: {
    icon: Sword,
    color: "text-amber-500",
    selected: "border-amber-500/50 bg-amber-600/15 shadow-amber-500/10",
  },
};

const defaultStyle: GenreStyle = {
  icon: Clapperboard,
  color: "text-sky-400",
  selected: "border-sky-400/50 bg-sky-500/15 shadow-sky-500/10",
};

function getGenreStyle(genre: string): GenreStyle {
  const normalized = genre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  return genreStyles[normalized] ?? defaultStyle;
}

function PreferencesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando preferencias"
      className={`${glassCardClass} p-5 sm:p-7`}
    >
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-xl bg-slate-800" />
          <div className="h-4 w-36 animate-pulse rounded bg-slate-800" />
        </div>
        <div className="h-7 w-32 animate-pulse rounded-full bg-slate-800/80" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 15 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-slate-800/80"
          />
        ))}
      </div>
    </div>
  );
}

export default function Preferences() {
  const {
    getGenres,
    setUserGenres,
    loading,
    saving,
    error: loadErrorFromApi,
  } = useGenres();

  const headerIconRef = useRef<SlidersHorizontalIconHandle>(null);

  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [initial, setInitial] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    getGenres()
      .then(({ availableGenres, userGenres }) => {
        if (!active) return;

        const genres = [...new Set(userGenres)];

        setAvailable(availableGenres);
        setSelected(genres);
        setInitial(genres);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [getGenres, retry]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const limitReached = selected.length >= 10;

  const changed =
    selected.length !== initial.length ||
    selected.some((genre) => !initial.includes(genre));

  const toggleGenre = useCallback((genre: string) => {
    setSelected((current) => {
      const exists = current.includes(genre);

      if (!exists && current.length >= 10) return current;

      return exists
        ? current.filter((item) => item !== genre)
        : [...current, genre];
    });

    setSuccess(false);
    setSaveError("");
  }, []);

  const clearSelection = useCallback(() => {
    setSelected([]);
    setSuccess(false);
    setSaveError("");
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setRetry((value) => value + 1);
  }, []);

  const handleSave = useCallback(async () => {
    if (loading || saving || !changed) return;

    try {
      setSaveError("");
      setSuccess(false);

      const saved = [...new Set(await setUserGenres(selected))];

      setSelected(saved);
      setInitial(saved);
      setSuccess(true);
    } catch {
      setSaveError("No se pudieron guardar las preferencias.");
    }
  }, [loading, saving, changed, selected, setUserGenres]);

  return (
    <PageLayout
      eyebrow="Personalización"
      title="Preferencias de géneros"
      icon={
        <SlidersHorizontalIcon
          ref={headerIconRef}
          size={14}
          animateOnHover={false}
        />
      }
      onEyebrowMouseEnter={() => headerIconRef.current?.startAnimation()}
      onEyebrowMouseLeave={() => headerIconRef.current?.stopAnimation()}
    >
      {loading && <PreferencesSkeleton />}

      {!loading && (loadError || loadErrorFromApi) && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
        >
          <span className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>No se pudieron cargar las preferencias.</span>
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

      {!loading && !loadError && !loadErrorFromApi && (
        <div className="space-y-5">
          {saveError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-300 backdrop-blur-xl sm:text-sm"
            >
              <span>{saveError}</span>
              <button
                type="button"
                onClick={() => setSaveError("")}
                aria-label="Cerrar aviso"
                className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-300 backdrop-blur-xl sm:text-sm"
            >
              <span>Preferencias guardadas correctamente.</span>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                aria-label="Cerrar aviso"
                className="cursor-pointer text-base leading-none opacity-70 transition-opacity hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          <div className={`${glassCardClass} p-5 sm:p-7`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-400">
                  <SparklesIcon size={19} />
                </div>

                <h2 className="text-sm font-semibold text-white sm:text-base">
                  Explora los géneros
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:block"
                >
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-sky-400 transition-all duration-300"
                    style={{ width: `${(selected.length / 10) * 100}%` }}
                  />
                </div>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums ${
                    limitReached
                      ? "border-sky-400/35 bg-sky-500/15 text-sky-300"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {selected.length}/10 seleccionados
                </span>
              </div>
            </div>

            {available.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">
                No hay géneros disponibles en este momento.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {available.map((genre) => {
                  const isSelected = selectedSet.has(genre);
                  const isDisabled = (!isSelected && limitReached) || saving;
                  const style = getGenreStyle(genre);
                  const Icon = style.icon;

                  return (
                    <label
                      key={genre}
                      className={`group relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-3 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                        isSelected
                          ? `${style.selected} shadow-lg`
                          : "border-white/10 bg-white/2.5 hover:border-white/20 hover:bg-white/5"
                      } ${
                        isDisabled
                          ? "cursor-not-allowed opacity-40 hover:translate-y-0"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => toggleGenre(genre)}
                        className="sr-only"
                      />

                      <Icon
                        size={34}
                        strokeWidth={1.7}
                        className={`transition-all duration-300 ${
                          style.color
                        } ${
                          isSelected
                            ? "scale-110 drop-shadow-[0_0_10px_currentColor]"
                            : "group-hover:scale-110"
                        }`}
                      />

                      <span className="text-sm font-semibold tracking-wide text-slate-200 transition-colors group-hover:text-white">
                        {genre}
                      </span>

                      {isSelected && (
                        <span className="absolute -bottom-8 -right-8 size-20 rounded-full bg-white/5 blur-2xl" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2.5 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={clearSelection}
                disabled={!selected.length || saving}
                className="h-11 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
              >
                Limpiar selección
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!changed || saving || loading}
                className="h-11 cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-sky-500 px-5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-sm"
              >
                {saving ? "Guardando..." : "Guardar preferencias"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
