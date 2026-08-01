import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";
import type { RootState } from "@/redux/store";
import type { Language } from "@/lib/i18n/settings";
import { SearchProvider } from "@/contexts/SearchContext";
import { makeTestStore, type TestStore } from "./store";
import { getTestI18n } from "./i18n";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  route?: string;
  locale?: Language;
  theme?: "light" | "dark";
}

function TestProviders({
  children,
  store,
  locale,
  theme,
}: {
  children: ReactNode;
  store: TestStore;
  locale: Language;
  theme: "light" | "dark";
}) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme={theme} forcedTheme={theme}>
        <I18nextProvider i18n={getTestI18n(locale)}>
          <SearchProvider>{children}</SearchProvider>
        </I18nextProvider>
      </ThemeProvider>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    locale = "pt",
    theme = "dark",
    ...renderOptions
  }: RenderWithProvidersOptions = {},
): RenderResult & { store: TestStore; user: UserEvent } {
  const store = makeTestStore(preloadedState);
  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }) => (
      <TestProviders store={store} locale={locale} theme={theme}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });

  return { ...result, store, user };
}
