import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const glassCardClass =
  "relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/45 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl backdrop-saturate-150";

interface PageLayoutProps {
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  onEyebrowMouseEnter?: () => void;
  onEyebrowMouseLeave?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  action?: ReactNode;
  ariaBusy?: boolean;
  children: ReactNode;
}

export default function PageLayout({
  eyebrow,
  title,
  icon,
  onEyebrowMouseEnter,
  onEyebrowMouseLeave,
  showBack = true,
  onBack,
  action,
  ariaBusy,
  children,
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <main
      aria-busy={ariaBusy}
      className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 pb-28 md:px-8"
    >
      <header className="space-y-4">
        {showBack && (
          <button
            type="button"
            onClick={onBack ?? (() => navigate(-1))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-slate-900/50 px-4 py-2 text-xs font-medium text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sky-400" />
            <span>Volver</span>
          </button>
        )}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <div
              onMouseEnter={onEyebrowMouseEnter}
              onMouseLeave={onEyebrowMouseLeave}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400"
            >
              {icon}
              <span>{eyebrow}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {title}
            </h1>
          </div>

          {action}
        </div>
      </header>

      {children}
    </main>
  );
}
