import { createContext, useContext } from "react";
import type { User } from "../api/types";
import type { AuthCredentials } from "../api/services/auth";

export interface UserContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: AuthCredentials) => Promise<User>;
  register: (credentials: AuthCredentials) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

export const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser debe utilizarse dentro de UserProvider");
  }

  return context;
}
