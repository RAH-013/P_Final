import { useContext, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import {
  SlidersHorizontalIcon,
  type SlidersHorizontalIconHandle,
  SparklesIcon,
  type SparklesIconHandle,
  MessageCircleMoreIcon,
  type MessageCircleMoreIconHandle,
  HeartIcon,
  type HeartIconHandle,
  UsersIcon,
  type UsersIconHandle,
} from "lucide-animated";

import { UserContext } from "../contexts/UserContext";

type MenuIconHandle =
  | SlidersHorizontalIconHandle
  | SparklesIconHandle
  | MessageCircleMoreIconHandle
  | HeartIconHandle
  | UsersIconHandle;

interface MenuItem {
  label: string;
  path: string;
  Icon:
    | typeof SlidersHorizontalIcon
    | typeof SparklesIcon
    | typeof MessageCircleMoreIcon
    | typeof HeartIcon
    | typeof UsersIcon;
  featured?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Preferencias",
    path: "/preferences",
    Icon: SlidersHorizontalIcon,
  },
  {
    label: "Recomendaciones",
    path: "/recommendations",
    Icon: SparklesIcon,
    featured: true,
  },
  {
    label: "Comentarios",
    path: "/comments",
    Icon: MessageCircleMoreIcon,
  },
  {
    label: "Favoritas",
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
        {
          label: "Administración",
          path: "/admin",
          Icon: UsersIcon,
        },
        ...menuItems,
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
            transform: translate3d(0, 24px, 0) scale(0.94);
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

        @keyframes nexus-orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes nexus-aura-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.97);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.03);
          }
        }

        @keyframes nexus-star-rainbow {
          0% {
            filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(192, 132, 252, 0.7));
          }
          100% {
            filter: hue-rotate(360deg) drop-shadow(0 0 6px rgba(192, 132, 252, 0.7));
          }
        }
      `}</style>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute size-0 overflow-hidden"
      >
        <defs>
          <linearGradient
            id="nexus-star-rainbow-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="28%" stopColor="#c084fc" />
            <stop offset="56%" stopColor="#f472b6" />
            <stop offset="82%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
      </svg>

      <nav
        aria-label="Navegación principal"
        className="fixed bottom-5 left-1/2 z-50 max-w-[calc(100vw-1rem)] -translate-x-1/2"
      >
        <div className="relative animate-[nexus-dock-enter_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full bg-linear-to-r from-blue-500/20 via-sky-400/30 to-cyan-500/20 opacity-85 blur-xl"
          />

          <div className="relative flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/55 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.28),inset_0_-1px_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 hover:border-white/30 sm:gap-2 sm:p-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/14 via-white/2 to-transparent"
            />

            {items.map(({ label, path, Icon, featured }, index) => {
              if (featured) {
                return (
                  <div
                    key={path}
                    className="relative flex items-center gap-1.5 sm:gap-2"
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className="h-5 w-px bg-white/12"
                      />
                    )}

                    <div className="relative flex items-center justify-center">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-1 rounded-full bg-linear-to-r from-blue-500/45 via-sky-400/60 to-cyan-400/45 blur-md animate-[nexus-aura-pulse_3.5s_ease-in-out_infinite]"
                      />

                      <NavLink
                        to={path}
                        aria-label={label}
                        onMouseEnter={() =>
                          iconRefs.current[index]?.startAnimation()
                        }
                        onMouseLeave={() =>
                          iconRefs.current[index]?.stopAnimation()
                        }
                        onFocus={() =>
                          iconRefs.current[index]?.startAnimation()
                        }
                        onBlur={() => iconRefs.current[index]?.stopAnimation()}
                        className={({ isActive }) =>
                          `group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full p-[1.5px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:h-12 ${
                            isActive
                              ? "shadow-[0_12px_32px_-4px_rgba(14,165,233,0.75)]"
                              : "shadow-[0_10px_24px_-4px_rgba(37,99,235,0.6)] hover:shadow-[0_14px_34px_-4px_rgba(14,165,233,0.8)]"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-[-120%] animate-[nexus-orbit_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_55%,#7dd3fc_75%,#ffffff_86%,#38bdf8_96%,transparent_100%)]"
                            />

                            <span
                              className={`relative flex h-full items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-blue-600 via-sky-500 to-cyan-400 bg-size-[200%_200%] animate-[nexus-gradient-shift_5s_ease_infinite] px-4 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] sm:gap-2.5 sm:px-5 ${
                                isActive ? "brightness-110" : ""
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-[nexus-shimmer_3.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/35 to-transparent"
                              />

                              <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-950/35 ring-1 ring-white/30 shadow-inner sm:size-7">
                                <Icon
                                  ref={(element) => {
                                    iconRefs.current[index] = element;
                                  }}
                                  size={16}
                                  animateOnHover={false}
                                  className="shrink-0 animate-[nexus-star-rainbow_4.5s_linear_infinite] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 [&_circle]:stroke-[url(#nexus-star-rainbow-grad)] [&_path]:stroke-[url(#nexus-star-rainbow-grad)]"
                                />
                              </span>

                              <span className="relative flex items-center gap-1.5 whitespace-nowrap text-xs font-bold tracking-tight sm:text-sm">
                                <span>{label}</span>
                                <span className="hidden rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 sm:inline-block">
                                  IA
                                </span>
                              </span>
                            </span>
                          </>
                        )}
                      </NavLink>
                    </div>

                    {index < items.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="h-5 w-px bg-white/12"
                      />
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={path}
                  to={path}
                  aria-label={label}
                  onMouseEnter={() => iconRefs.current[index]?.startAnimation()}
                  onMouseLeave={() => iconRefs.current[index]?.stopAnimation()}
                  onFocus={() => iconRefs.current[index]?.startAnimation()}
                  onBlur={() => iconRefs.current[index]?.stopAnimation()}
                  className={({ isActive }) =>
                    `group relative inline-flex h-11 min-w-11 items-center rounded-full px-3 transition-[background-color,color,padding,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/12 hover:pr-3.5 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
                      isActive
                        ? "bg-white/15 text-sky-300 ring-1 ring-sky-400/35 shadow-[0_0_18px_rgba(56,189,248,0.22),inset_0_1px_1px_rgba(255,255,255,0.28)]"
                        : "text-slate-300/75"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        ref={(element) => {
                          iconRefs.current[index] = element;
                        }}
                        size={20}
                        animateOnHover={false}
                        className={
                          isActive
                            ? "shrink-0 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] transition-transform duration-500 group-hover:scale-105"
                            : "shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:text-sky-300"
                        }
                      />

                      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium text-white opacity-0 transition-[max-width,opacity,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-36 group-hover:pl-2 group-hover:opacity-100 group-focus-visible:max-w-36 group-focus-visible:pl-2 group-focus-visible:opacity-100">
                        {label}
                      </span>

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 left-5.5 size-1 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.95)]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Menu;
