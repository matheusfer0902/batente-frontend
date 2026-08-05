import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";
import type { RootState } from "@/redux/store";
import type { Language } from "@/lib/i18n/settings";
import { SearchProvider } from "@/contexts/SearchContext";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { makeTestStore, type TestStore } from "./store";
import { getTestI18n } from "./i18n";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  route?: string;
  locale?: Language;
  theme?: "light" | "dark";
  /**
   * Monta o `SessionProvider`, que é o que dispara o `GET /auth/me` de boot.
   *
   * Desligado por padrão: a maioria dos testes pré-carrega a sessão com
   * `authState()` e não deve pagar uma ida à rede. Ligue quando o que está sob
   * teste **é** a descoberta de sessão — inclusive a corrida entre a consulta de
   * boot e o login, que só existe quando essa consulta existe.
   */
  withSession?: boolean;
}

function TestProviders({
  children,
  store,
  locale,
  theme,
  withSession,
}: {
  children: ReactNode;
  store: TestStore;
  locale: Language;
  theme: "light" | "dark";
  withSession: boolean;
}) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme={theme} forcedTheme={theme}>
        <I18nextProvider i18n={getTestI18n(locale)}>
          <SearchProvider>
            {withSession ? <SessionProvider /> : null}
            {children}
          </SearchProvider>
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
    withSession = false,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
): RenderResult & { store: TestStore; user: UserEvent } {
  const store = makeTestStore(preloadedState);
  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }) => (
      <TestProviders
        store={store}
        locale={locale}
        theme={theme}
        withSession={withSession}
      >
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });

  return { ...result, store, user };
}
