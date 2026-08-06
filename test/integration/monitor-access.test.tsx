import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AccessMonitor } from "@/components/access/AccessMonitor";
import { mockDb } from "@/lib/mock/mockDb";
import { renderWithProviders } from "../helpers/render";
import { authState } from "../helpers/auth";

describe("monitor de acessos", () => {
  it("I3 · carrega feed, stats e totem via MSW", async () => {
    renderWithProviders(<AccessMonitor />, {
      preloadedState: authState("ADMIN"),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /monitor de acessos/i }),
      ).toBeInTheDocument();
    });

    const latestEvent = mockDb.accessEvents[0]!;
    expect(await screen.findByText(latestEvent.employee!.name)).toBeInTheDocument();
    expect(screen.getByText(String(mockDb.accessStats.granted))).toBeInTheDocument();
    expect(screen.getByText(/online/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(latestEvent.employee!.name, "i") }),
    ).toHaveAttribute("href", `/acessos/${latestEvent.id}`);
  });
});
