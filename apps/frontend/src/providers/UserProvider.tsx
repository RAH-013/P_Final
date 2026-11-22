import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Outlet } from "react-router-dom";

import {
  login as loginRequest,
  register as registerRequest,
  type AuthCredentials,
} from "../api/services/auth";

import { getMyProfile } from "../api/services/users";
import type { User } from "../api/types";

import { UserContext } from "../contexts/UserContext";
import type { UserContextValue } from "../contexts/UserContext";

export const TOKEN_KEY = "nexus_token";

interface UserProviderProps {
  children?: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const profile = await getMyProfile();

      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials): Promise<User> => {
      const response = await loginRequest(credentials);

      localStorage.setItem(TOKEN_KEY, response.token);

      const profile = await refreshUser();

      if (!profile) {
        logout();
        throw new Error("No fue posible recuperar el perfil del usuario.");
      }

      return profile;
    },
    [refreshUser, logout],
  );

  const register = useCallback(
    async (credentials: AuthCredentials): Promise<User> => {
      const response = await registerRequest(credentials);

      localStorage.setItem(TOKEN_KEY, response.token);

      const profile = await refreshUser();

      if (!profile) {
        logout();
        throw new Error("No fue posible recuperar el perfil del usuario.");
      }

      return profile;
    },
    [refreshUser, logout],
  );

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await refreshUser();
      } finally {
        if (active) setLoading(false);
      }
    };

    const handleUnauthorized = () => logout();

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    void initialize();

    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [refreshUser, logout]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return (
    <UserContext.Provider value={value}>
      {children ?? <Outlet />}
    </UserContext.Provider>
  );
}
