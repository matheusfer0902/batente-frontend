import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

/**
 * `<input type="checkbox">` nativo com o acento da identidade.
 *
 * `accent-color` faz o navegador pintar o controle nativo sem que a gente
 * precise escondê-lo atrás de um `<div>`. O caminho de esconder-e-redesenhar é
 * o que costuma quebrar navegação por teclado e o anúncio de estado no leitor
 * de tela — e os dois lugares onde este componente entra são justamente os que
 * não podem falhar: a grade dos sete dias da escala e a confirmação de que a
 * chave do totem foi copiada.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-input accent-[var(--chart)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
