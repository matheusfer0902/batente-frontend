import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { ResourceList } from "@/components/resource/ResourceList";
import { renderWithProviders } from "../helpers/render";
import { authState } from "../helpers/auth";
import { server } from "../setup/msw.server";
import { testDb } from "../mocks/db";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import { scenarios } from "../mocks/scenarios";

describe("ResourceList", () => {
  it("I1 · exibe carregamento e depois dados", async () => {
    renderWithProviders(<ResourceList />, {
      preloadedState: authState("ADMIN"),
    });

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Primeiro recurso")).toBeInTheDocument();
    });
  });

  it("I1 · exibe estado vazio quando não há recursos", async () => {
    testDb.resources = [];

    renderWithProviders(<ResourceList />, {
      preloadedState: authState("ADMIN"),
    });

    await waitFor(() => {
      expect(screen.getByText(/nenhum recurso encontrado/i)).toBeInTheDocument();
    });
  });

  it("I1 · exibe erro quando a API falha", async () => {
    scenarios.servidorIndisponivel();

    server.use(
      http.get(`${API_BASE_URL}/resources`, () =>
        HttpResponse.json(
          { message: "Service unavailable", code: "server_unavailable" },
          { status: 503 },
        ),
      ),
    );

    renderWithProviders(<ResourceList />, {
      preloadedState: authState("ADMIN"),
    });

    await waitFor(() => {
      expect(screen.queryByText("Primeiro recurso")).not.toBeInTheDocument();
    });
  });
});
