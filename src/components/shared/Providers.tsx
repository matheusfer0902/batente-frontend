"use client";

import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import i18next from "@/lib/i18n/client";
import { StoreProvider } from "@/redux/storeProvider";
import { SearchProvider } from "@/contexts/SearchContext";
import { AuthHydrator } from "@/components/auth/AuthHydrator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nextProvider i18n={i18next}>
          <SearchProvider>
            <AuthHydrator />
            {children}
            <Toaster richColors closeButton position="top-right" />
          </SearchProvider>
        </I18nextProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
