import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { expectNoA11yViolations } from "../../../test/helpers/a11y";

describe("Button", () => {
  it("B1 · renderiza variantes sem erro", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ] as const;

    variants.forEach((variant) => {
      const { unmount } = render(
        <Button variant={variant}>Botão {variant}</Button>,
      );
      expect(screen.getByRole("button", { name: `Botão ${variant}` })).toBeInTheDocument();
      unmount();
    });
  });

  it("B3 · desabilitado não dispara onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Desabilitado
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Desabilitado" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("a11y · sem violações axe no tema escuro", async () => {
    const { container } = render(<Button>Salvar</Button>);
    await expectNoA11yViolations(container);
  });
});
