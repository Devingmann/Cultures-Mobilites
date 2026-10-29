"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import type { CurrentUser } from "./types";

type SessionContextValue = {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;
};

const SessionContext = createContext<SessionContextValue>({
  user: null,
  setUser: () => undefined,
});

export const useSession = () => useContext(SessionContext);

export function Providers({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <SessionContext.Provider value={{ user, setUser }}>
        {children}
      </SessionContext.Provider>
    </QueryClientProvider>
  );
}
