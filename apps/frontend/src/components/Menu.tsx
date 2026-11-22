import { useContext, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import {
  SlidersHorizontalIcon,
  type SlidersHorizontalIconHandle,
  SparklesIcon,
  type SparklesIconHandle,
  HeartIcon,
  type HeartIconHandle,
  UsersIcon,
  type UsersIconHandle,
} from "lucide-animated";

import { UserContext } from "../contexts/UserContext";

type MenuIconHandle =
  | SlidersHorizontalIconHandle
  | SparklesIconHandle
  | HeartIconHandle
  | UsersIconHandle;

interface MenuItem {
  label: string;
  description: string;
  path: string;
  Icon:
    | typeof SlidersHorizontalIcon
    | typeof SparklesIcon
    | typeof HeartIcon
    | typeof UsersIcon;
  featured?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Preferencias",
    description: "Tus géneros",
    path: "/preferences",
    Icon: SlidersHorizontalIcon,
  },
  {
    label: "Recomendaciones",
    description: "Para descubrir",
    path: "/recommendations",
    Icon: SparklesIcon,
    featured: true,
  },
  {
    label: "Favoritas",
    description: "Tu colección",
    path: "/likes",
    Icon: HeartIcon,
  },
];

function Menu() {
  const context = useContext(UserContext);
  const iconRefs = useRef<(MenuIconHandle | null)[]>([]);

  const isVisible = Boolean(context?.isAuthenticated && context?.user);

  const items: MenuItem[] = context?.isAdmin
    ? [
        ...menuItems,
        {
          label: "Administración",
          description: "Gestionar cuentas",
          path: "/admin",
          Icon: UsersIcon,
        },
      ]
    : menuItems;

  const featuredIndex = items.findIndex((item) => item.featured);

  useEffect(() => {
    if (!isVisible || featuredIndex === -1) return;

    let stopTimeout: number | undefined;

    const triggerSparkle = () => {
      const icon = iconRefs.current[featuredIndex];
      if (!icon) return;

      icon.startAnimation();
      stopTimeout = window.setTimeout(() => {
        icon.stopAnimation();
      }, 1200);
    };

    const initialTimeout = window.setTimeout(triggerSparkle, 700);
    const interval = window.setInterval(triggerSparkle, 4500);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
      if (stopTimeout) window.clearTimeout(stopTimeout);
    };
  }, [isVisible, featuredIndex]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes nexus-dock-enter {
          0% {
            opacity: 0;
            transform: translate3d(0, 28px, 0) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes nexus-shimmer {
          0% {
            transform: translateX(-140%) skewX(-20deg);
          }
          45%, 100% {
            transform: translateX(260%) skewX(-20deg);
          }
        }

        @keyframes nexus-gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      <nav
        aria-label="Navegación principal"
        className="fixed bottom-5 left-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
      >
        <div className="relative animate-[nexus-dock-enter_0.65s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full bg-linear-to-r from-blue-500/25 via-sky-400/35 to-cyan-500/25 opacity-90 blur-xl"
          />

          <div className="relative flex items-center gap-1 rounded-full border border-white/25 bg-slate-900/40 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-white/35 sm:gap-1.5 sm:p-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/16 via-white/2 to-transparent"
            />

            {items.map(
              ({ label, description, path, Icon, featured }, index) => (
                <NavLink
                  key={path}
                  to={path}
                  aria-label={label}
                  title={label}
                  onMouseEnter={() => iconRefs.current[index]?.startAnimation()}
                  onMouseLeave={() => iconRefs.current[index]?.stopAnimation()}
                  onFocus={() => iconRefs.current[index]?.startAnimation()}
                  onBlur={() => iconRefs.current[index]?.stopAnimation()}
                  className={({ isActive }) => {
                    if (featured) {
                      return `group relative flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-blue-600 via-sky-500 to-cyan-500 bg-size-[200%_200%] animate-[nexus-gradient-shift_5s_ease_infinite] px-3.5 py-2.5 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.97] sm:gap-2.5 sm:px-5 sm:py-3 ${
                        isActive
                          ? "ring-2 ring-white/80 shadow-[0_12px_30px_-4px_rgba(14,165,233,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)]"
                          : "ring-1 ring-white/35 shadow-[0_10px_25px_-4px_rgba(37,99,235,0.55),inset_0_1px_1px_rgba(255,255,255,0.45)] hover:shadow-[0_14px_32px_-4px_rgba(14,165,233,0.7),inset_0_1px_1px_rgba(255,255,255,0.55)]"
                      }`;
                    }

                    return `group relative flex items-center gap-2.5 rounded-full px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 sm:px-4 sm:py-3 ${
                      isActive
                        ? "bg-white/14 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28)] ring-1 ring-white/25 backdrop-blur-md"
                        : "text-slate-200/80 hover:bg-white/10 hover:text-white"
                    }`;
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {featured && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-[nexus-shimmer_3.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/35 to-transparent"
                        />
                      )}

                      <span className="relative flex items-center justify-center">
                        <Icon
                          ref={(element) => {
                            iconRefs.current[index] = element;
                          }}
                          size={featured ? 20 : 19}
                          animateOnHover={false}
                          className={
                            featured
                              ? "shrink-0 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.75)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                              : isActive
                                ? "shrink-0 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)] transition-transform duration-300 group-hover:scale-110"
                                : "shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-sky-300"
                          }
                        />
                      </span>

                      <span
                        className={
                          featured
                            ? "relative flex flex-col text-left"
                            : "hidden flex-col text-left sm:flex"
                        }
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold leading-tight">
                          <span>{label}</span>
                          {featured && (
                            <span
                              aria-hidden="true"
                              className="size-1.5 animate-ping rounded-full bg-white"
                            />
                          )}
                        </span>

                        <span
                          className={
                            featured
                              ? "mt-0.5 hidden text-[10px] font-medium leading-tight text-sky-100/95 sm:block"
                              : "mt-0.5 text-[10px] leading-tight text-slate-300/65 transition-colors group-hover:text-slate-200/85"
                          }
                        >
                          {description}
                        </span>
                      </span>

                      {!featured && isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.95)]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ),
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Menu;
