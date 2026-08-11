import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { AccessDetail } from "@/components/access/AccessDetail";
import { AccessHistoryList } from "@/components/history/AccessHistoryList";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import type { AccessEvent } from "@/types/access";
import { server } from "../setup/msw.server";
import { renderWithProviders } from "../helpers/render";
import { authState } from "../helpers/auth";

const base = API_BASE_URL;

/**
 * O motivo da negação chegava no payload e não era renderizado em nenhuma das
 * telas de depuração — só no widget da `/inicio`. Estes casos prendem a
 * correção, e prendem também a **resolução da chave**: `denial.*` vive em
 * `access`, e o histórico carrega `["history","access","common"]` com uma chave
 * `decision` própria. Um teste que só checasse "renderiza algo" passaria com a
 * chave crua na tela.
 */
function evento(overrides: Partial<AccessEvent> = {}): AccessEvent {
  return {
    id: "4b8246e7-5798-42fa-88be-13c29d4e1f39",
    occurredAt: "2026-08-11T01:46:33.000Z",
    receivedAt: "2026-08-11T01:46:33.500Z",
    clockDriftMs: 0,
    decision: "DENIED",
    denialReason: "OUTSIDE_WINDOW",
    mode: "ONLINE",
    syncedAt: null,
    badgeCode: "830D31DD",
    employee: {
      id: "d4720bf3-40e7-4919-9e2e-e1fc586103ce",
      name: "MATHEUS FERREIRA",
      registration: "20200127321",
      department: "Operações",
    },
    device: { id: "dev-1", name: "Totem Portaria ESP32", location: "Entrada" },
    doorOpenMs: null,
    timeEntry: null,
    ...overrides,
  } as AccessEvent;
}

describe("motivo da negação · histórico", () => {
  it("mostra FORA DO HORÁRIO na coluna Decisão, não apenas BARRADO", async () => {
    server.use(
      http.get(`${base}/access-events`, () =>
        HttpResponse.json({ items: [evento()], total: 1, page: 1, limit: 50 }),
      ),
    );

    renderWithProviders(<AccessHistoryList />, {
      preloadedState: authState("ADMIN"),
    });

    expect(await screen.findByText(/fora do horário/i)).toBeInTheDocument();
  });

  it("distingue crachá bloqueado de crachá desconhecido — os dois vêm sem colaborador", async () => {
    server.use(
      http.get(`${base}/access-events`, () =>
        HttpResponse.json({
          items: [
            evento({
              id: "a8759f22-897f-47a0-aeba-25b9983e1418",
              denialReason: "CREDENTIAL_BLOCKED",
              badgeCode: "04D5E6F7",
              employee: null,
            }),
            evento({
              id: "7f85f1e3-6478-491a-a74f-9bd0567c3bca",
              denialReason: "UNKNOWN_UID",
              badgeCode: "DEADBEEF",
              employee: null,
            }),
          ],
          total: 2,
          page: 1,
          limit: 50,
        }),
      ),
    );

    renderWithProviders(<AccessHistoryList />, {
      preloadedState: authState("ADMIN"),
    });

    // `fn_decidir_acesso` devolve identidade nula em CREDENTIAL_BLOCKED, então
    // as duas linhas dizem "Crachá não identificado". O motivo é a única coisa
    // que separa "cartão que existe e foi bloqueado" de "cartão que nunca
    // existiu" — e são ações opostas para quem está depurando.
    expect(await screen.findByText(/crachá bloqueado/i)).toBeInTheDocument();
    expect(screen.getByText(/crachá desconhecido/i)).toBeInTheDocument();
  });

  it("concedido continua mostrando CONCEDIDO, sem motivo", async () => {
    server.use(
      http.get(`${base}/access-events`, () =>
        HttpResponse.json({
          items: [
            evento({ decision: "GRANTED", denialReason: null, doorOpenMs: 3000 }),
          ],
          total: 1,
          page: 1,
          limit: 50,
        }),
      ),
    );

    renderWithProviders(<AccessHistoryList />, {
      preloadedState: authState("ADMIN"),
    });

    expect(await screen.findByText(/concedido/i)).toBeInTheDocument();
  });
});

describe("motivo da negação · detalhe do acesso", () => {
  it("imprime o motivo ao lado da pill BARRADO", async () => {
    server.use(
      http.get(`${base}/access-events/:id`, () => HttpResponse.json(evento())),
    );

    renderWithProviders(<AccessDetail id={evento().id} />, {
      preloadedState: authState("ADMIN"),
    });

    // A pill mantém a leitura de um segundo, pela cor; o motivo responde a
    // pergunta seguinte de quem abriu o detalhe
    expect(await screen.findByText(/barrado/i)).toBeInTheDocument();
    expect(screen.getByText(/fora do horário/i)).toBeInTheDocument();
  });

  it("concedido não imprime motivo nenhum", async () => {
    server.use(
      http.get(`${base}/access-events/:id`, () =>
        HttpResponse.json(
          evento({ decision: "GRANTED", denialReason: null, doorOpenMs: 3000 }),
        ),
      ),
    );

    renderWithProviders(<AccessDetail id={evento().id} />, {
      preloadedState: authState("ADMIN"),
    });

    expect(await screen.findByText(/concedido/i)).toBeInTheDocument();
    expect(screen.queryByText(/fora do horário/i)).not.toBeInTheDocument();
  });
});
