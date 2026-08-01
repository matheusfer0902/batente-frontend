"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SearchContextValue {
  query: string;
  setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");

  const value = useMemo(
    () => ({
      query,
      setQuery,
    }),
    [query],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
}
