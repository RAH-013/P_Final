import { Link } from "react-router-dom";

import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-slate-950/65 px-4 backdrop-blur-2xl backdrop-saturate-150 sm:px-6">
      <div className="mx-auto flex min-h-19 w-full max-w-[1800px] items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="Nexus - Inicio"
          className="flex shrink-0 items-center transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="Nexus"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        <div className="hidden min-w-0 max-w-xl flex-1 md:block">
          <HeaderSearch />
        </div>

        <HeaderActions />
      </div>
    </header>
  );
}

export default Header;
