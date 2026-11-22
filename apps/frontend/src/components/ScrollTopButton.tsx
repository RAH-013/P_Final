import { useEffect, useRef, useState, type RefObject } from "react";
import {
  ArrowBigUpDashIcon,
  type ArrowBigUpDashIconHandle,
} from "lucide-animated";

interface ScrollTopButtonProps {
  target?: RefObject<HTMLElement | null>;
  threshold?: number;
}

function ScrollTopButton({ target, threshold = 300 }: ScrollTopButtonProps) {
  const arrowRef = useRef<ArrowBigUpDashIconHandle>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const customTarget = target?.current;

    const getScrollTop = () => {
      if (customTarget) {
        return customTarget.scrollTop;
      }

      const mainElement = document.querySelector("main");

      return Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        mainElement?.scrollTop ?? 0,
      );
    };

    const handleScroll = () => {
      setVisible(getScrollTop() > threshold);
    };

    handleScroll();

    if (customTarget) {
      customTarget.addEventListener("scroll", handleScroll, { passive: true });
      return () => customTarget.removeEventListener("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [target, threshold]);

  const scrollToTop = () => {
    if (target?.current) {
      target.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const mainElement = document.querySelector("main");

    if (mainElement && mainElement.scrollTop > 0) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      aria-hidden={!visible}
      className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0"
      }`}
    >
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-full bg-linear-to-r from-blue-500/25 via-sky-400/35 to-cyan-500/25 opacity-90 blur-xl"
        />

        <div className="relative rounded-full border border-white/25 bg-slate-900/40 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-white/35 sm:p-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-white/16 via-white/[0.02] to-transparent"
          />

          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={scrollToTop}
            onMouseEnter={() => arrowRef.current?.startAnimation()}
            onMouseLeave={() => arrowRef.current?.stopAnimation()}
            onFocus={() => arrowRef.current?.startAnimation()}
            onBlur={() => arrowRef.current?.stopAnimation()}
            aria-label="Volver arriba"
            title="Volver arriba"
            className="group relative flex cursor-pointer items-center justify-center rounded-full p-2.5 text-slate-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 sm:p-3"
          >
            <ArrowBigUpDashIcon
              ref={arrowRef}
              size={20}
              animateOnHover={false}
              aria-hidden="true"
              className="shrink-0 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)] transition-all duration-300 group-hover:scale-110 group-hover:text-sky-300"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScrollTopButton;
