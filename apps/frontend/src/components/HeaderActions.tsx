import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  LogoutIcon,
  type UserIconHandle,
  type LogoutIconHandle,
} from "lucide-animated";

import { useUser } from "../contexts/UserContext";

function HeaderActions() {
  const context = useUser();
  const navigate = useNavigate();

  const loginRef = useRef<UserIconHandle>(null);
  const logoutRef = useRef<LogoutIconHandle>(null);

  if (!context) {
    throw new Error("HeaderActions debe utilizarse dentro de UserProvider");
  }

  function handleLogout() {
    context.logout();
    navigate("/auth", { replace: true });
  }

  return (
    <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
      {context.isAuthenticated && context.user ? (
        <>
          <Link
            to="/profile"
            className="flex max-w-40 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-[#55d6c7]/30 hover:bg-white/10 hover:text-[#55d6c7]"
          >
            <UserIcon size={17} />
            <span className="truncate">{context.user.username}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={() => logoutRef.current?.startAnimation()}
            onMouseLeave={() => logoutRef.current?.stopAnimation()}
            onFocus={() => logoutRef.current?.startAnimation()}
            onBlur={() => logoutRef.current?.stopAnimation()}
            className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-600/90 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 backdrop-blur-md transition-all duration-300 hover:border-red-300/40 hover:bg-red-500 hover:shadow-red-500/20 sm:px-4"
          >
            <LogoutIcon ref={logoutRef} size={17} animateOnHover={false} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </>
      ) : (
        <Link
          to="/auth"
          className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-600/90 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 backdrop-blur-md transition-all duration-300 hover:border-indigo-300/40 hover:bg-indigo-500 hover:shadow-indigo-500/20 sm:px-4"
          onMouseEnter={() => loginRef.current?.startAnimation()}
          onMouseLeave={() => loginRef.current?.stopAnimation()}
          onFocus={() => loginRef.current?.startAnimation()}
          onBlur={() => loginRef.current?.stopAnimation()}
        >
          <UserIcon ref={loginRef} size={17} animateOnHover={false} />
          <span>Autenticarse</span>
        </Link>
      )}
    </nav>
  );
}

export default HeaderActions;
