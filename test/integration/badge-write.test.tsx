import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BadgeDetailView } from "@/components/badge/BadgeDetailView";
import { BadgeForm } from "@/components/badge/BadgeForm";
import { API_BASE_URL } from "@/redux/reducers/queries/fetchBaseQuery";
import type { CredentialDetail, CredentialStatus } from "@/types/badge";
import { server } from "../setup/msw.server";
import { renderWithProviders } from "../helpers/render";
import { authState } from "../helpers/auth";

const base = API_BASE_URL;

/**
 * Mocka **rede**, nunca o hook orquestrador — é o que faz o teste cobrir o
 * caminho real: RTK Query → `hybridBaseQuery` → `apiError` → mensagem na tela.
 * Substituir `useIssueBadgeMutation` por um espião provaria que o componente
 * chama uma função, e não que a recusa do banco chega ao usuário legível.
 */
const SEM_CRACHA = {
  items: [
    {
      id: "emp-1",
      name: "BEATRIZ MOURA ALMEIDA",
      registration: "20200001364",
      department: { id: "dep-1", name: "Operações" },
      badgeCode: null,
      scheduleName: "Administrativo 44h",
      status: "ACTIVE",
      flags: { missingBadge: true, missingSchedule: false },
    },
  ],
  total: 1,
  page: 1,
  limit: 200,
};

function credencial(status: CredentialStatus): CredentialDetail {
  return {
    id: "cred-1",
    uid: "830D31DD",
    status,
    label: null,
    validUntil: null,
    employee: {
      id: "emp-1",
      name: "BEATRIZ MOURA ALMEIDA",
      registration: "20200001364",
    },
    type: "RFID_MIFARE",
    issuedAt: "2026-08-01T12:00:00.000Z",
    revokedAt: status === "LOST" || status === "REVOKED" ? "2026-08-05T12:00:00.000Z" : null,
    revokedReason: null,
  };
}

function candidatos() {
  return http.get(`${base}/employees`, () => HttpResponse.json(SEM_CRACHA));
}

describe("vínculo de crachá · tela 18", () => {
  it("oferece só quem está sem crachá ativo — RN-2.1 recusaria os demais", async () => {
    server.use(candidatos());

    renderWithProviders(<BadgeForm />, { preloadedState: authState("RH") });

    expect(
      await screen.findByRole("option", { name: /20200001364 · BEATRIZ/i }),
    ).toBeInTheDocument();
  });

  it("mantém o envio bloqueado enquanto o UID não tem 8 caracteres hex", async () => {
    server.use(candidatos());
    const usuario = userEvent.setup();

    renderWithProviders(<BadgeForm />, { preloadedState: authState("RH") });

    const select = await screen.findByLabelText(/colaborador/i);
    await usuario.selectOptions(select, "emp-1");
    await usuario.type(screen.getByLabelText(/código do crachá/i), "830D31");

    expect(screen.getByRole("button", { name: /^vincular$/i })).toBeDisabled();
  });

  it("traduz o 409 de UID já ativo em vez de mostrar erro genérico", async () => {
    server.use(
      candidatos(),
      http.post(`${base}/badges`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            message: "Este UID já pertence a um crachá ativo.",
            code: "uid_already_active",
          },
          { status: 409 },
        ),
      ),
    );
    const usuario = userEvent.setup();

    renderWithProviders(<BadgeForm />, { preloadedState: authState("RH") });

    const select = await screen.findByLabelText(/colaborador/i);
    await usuario.selectOptions(select, "emp-1");
    await usuario.type(screen.getByLabelText(/código do crachá/i), "830D31DD");
    await usuario.click(screen.getByRole("button", { name: /^vincular$/i }));

    expect(
      await screen.findByText(/já pertence a um crachá ativo/i),
    ).toBeInTheDocument();
  });

  it("mostra o 403 do GRANT como falta de permissão, não como falha do servidor", async () => {
    server.use(
      candidatos(),
      http.post(`${base}/badges`, () =>
        HttpResponse.json(
          { statusCode: 403, message: "forbidden", code: "forbidden_by_role" },
          { status: 403 },
        ),
      ),
    );
    const usuario = userEvent.setup();

    renderWithProviders(<BadgeForm />, { preloadedState: authState("RH") });

    const select = await screen.findByLabelText(/colaborador/i);
    await usuario.selectOptions(select, "emp-1");
    await usuario.type(screen.getByLabelText(/código do crachá/i), "830D31DD");
    await usuario.click(screen.getByRole("button", { name: /^vincular$/i }));

    expect(
      await screen.findByText(/não tem permissão para esta operação/i),
    ).toBeInTheDocument();
  });
});

describe("detalhe de crachá · tela 17", () => {
  it("crachá ativo oferece bloquear, perda e revogar — não desbloquear", async () => {
    server.use(
      http.get(`${base}/badges/cred-1`, () =>
        HttpResponse.json(credencial("ACTIVE")),
      ),
    );

    renderWithProviders(<BadgeDetailView id="cred-1" />, {
      preloadedState: authState("RH"),
    });

    expect(await screen.findByRole("button", { name: /bloquear/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrar perda/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /revogar/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /desbloquear/i }),
    ).not.toBeInTheDocument();
  });

  it("RN-2.5 · crachá perdido só oferece segunda via", async () => {
    server.use(
      http.get(`${base}/badges/cred-1`, () =>
        HttpResponse.json(credencial("LOST")),
      ),
    );

    renderWithProviders(<BadgeDetailView id="cred-1" />, {
      preloadedState: authState("RH"),
    });

    expect(
      await screen.findByRole("button", { name: /emitir segunda via/i }),
    ).toBeInTheDocument();
    // Oferecer desbloquear daria um 409 previsível do gatilho do banco
    expect(
      screen.queryByRole("button", { name: /desbloquear/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /bloquear/i })).not.toBeInTheDocument();
  });

  it("exige motivo com 10 caracteres antes de deixar confirmar o bloqueio", async () => {
    server.use(
      http.get(`${base}/badges/cred-1`, () =>
        HttpResponse.json(credencial("ACTIVE")),
      ),
    );
    const usuario = userEvent.setup();

    renderWithProviders(<BadgeDetailView id="cred-1" />, {
      preloadedState: authState("RH"),
    });

    await usuario.click(await screen.findByRole("button", { name: /bloquear/i }));
    await usuario.type(screen.getByLabelText(/^motivo$/i), "perdeu");

    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
  });

  it("bloqueia e reflete o estado novo vindo do servidor", async () => {
    let status: CredentialStatus = "ACTIVE";
    server.use(
      http.get(`${base}/badges/cred-1`, () => HttpResponse.json(credencial(status))),
      http.post(`${base}/badges/cred-1/block`, () => {
        status = "BLOCKED";
        return HttpResponse.json(credencial("BLOCKED"));
      }),
    );
    const usuario = userEvent.setup();

    renderWithProviders(<BadgeDetailView id="cred-1" />, {
      preloadedState: authState("RH"),
    });

    await usuario.click(await screen.findByRole("button", { name: /bloquear/i }));
    await usuario.type(
      screen.getByLabelText(/^motivo$/i),
      "Cartao esquecido no vestiario",
    );
    await usuario.click(screen.getByRole("button", { name: /confirmar/i }));

    // A invalidação de tag refaz o GET, então o botão de desbloquear aparece
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /desbloquear/i }),
      ).toBeInTheDocument();
    });
  });

  it("campo que o papel não lê é dito, não mostrado como vazio", async () => {
    server.use(
      http.get(`${base}/badges/cred-1`, () =>
        HttpResponse.json({ ...credencial("ACTIVE"), issuedAt: null }),
      ),
    );

    renderWithProviders(<BadgeDetailView id="cred-1" />, {
      preloadedState: authState("OPERADOR"),
    });

    // "—" diria que o banco está vazio; o que houve é o GRANT não alcançar a
    // coluna, e a tela precisa distinguir uma coisa da outra
    expect(
      await screen.findByText(/seu perfil não vê este dado/i),
    ).toBeInTheDocument();
  });
});
