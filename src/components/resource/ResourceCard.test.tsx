import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { renderWithProviders } from "../../../test/helpers/render";
import { authState } from "../../../test/helpers/auth";
import { expectNoA11yViolations } from "../../../test/helpers/a11y";
import type { Resource } from "@/types/resource";

const ownedResource: Resource = {
  id: "resource-1",
  title: "Primeiro recurso",
  description: "Recurso de exemplo pertencente ao owner.",
  ownerId: "user-1",
  createdAt: "2026-07-31T12:00:00.000Z",
  updatedAt: "2026-07-31T12:00:00.000Z",
};

const foreignResource: Resource = {
  ...ownedResource,
  id: "resource-3",
  title: "Recurso do viewer",
  ownerId: "user-2",
};

describe("ResourceCard", () => {
  it("F3 · owner vê ações de editar", () => {
    renderWithProviders(<ResourceCard resource={ownedResource} />, {
      preloadedState: authState("ADMIN"),
    });

    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("F3 · não-owner não renderiza editar/excluir no DOM", () => {
    renderWithProviders(<ResourceCard resource={foreignResource} />, {
      preloadedState: authState("ADMIN"),
    });

    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /excluir/i })).not.toBeInTheDocument();
  });

  it("a11y · sem violações axe", async () => {
    const { container } = renderWithProviders(
      <ResourceCard resource={ownedResource} />,
      { preloadedState: authState("ADMIN") },
    );
    await expectNoA11yViolations(container);
  });
});
