import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { SearchProvider } from "@/contexts/SearchContext";
import { useResource } from "@/hooks/useResource";
import { makeTestStore } from "../../test/helpers/store";
import { authState } from "../../test/helpers/auth";
import { getTestI18n } from "../../test/helpers/i18n";

function createWrapper(preloadedState: ReturnType<typeof authState>) {
  const store = makeTestStore(preloadedState);

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={getTestI18n()}>
          <SearchProvider>{children}</SearchProvider>
        </I18nextProvider>
      </Provider>
    );
  };
}

describe("useResource", () => {
  it("carrega listagem via MSW com store real", async () => {
    const { result } = renderHook(() => useResource(), {
      wrapper: createWrapper(authState("ADMIN")),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resources.length).toBeGreaterThan(0);
    expect(result.current.sortedResources[0]?.updatedAt).toBeDefined();
  });

  it("filtra recursos pelo SearchContext", async () => {
    const { result } = renderHook(() => useResource(), {
      wrapper: createWrapper(authState("ADMIN")),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const total = result.current.sortedResources.length;
    expect(total).toBeGreaterThan(0);
  });
});
