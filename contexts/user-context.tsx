"use client";

import { authClient } from "@/lib/auth/client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type NeonUser = typeof authClient.$Infer.Session.user;

interface UserContextType {
  user: NeonUser | null;
  setUser: Dispatch<SetStateAction<NeonUser | null>>;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NeonUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const result = await authClient.getSession();
        if (!active) return;

        if (result.error) {
          setError(result.error.message ?? "Unable to load your session");
          return;
        }
        setUser(result.data?.session ? result.data.user : null);
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : "Unable to load your session");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ user, setUser, isLoading, error }), [user, isLoading, error]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
