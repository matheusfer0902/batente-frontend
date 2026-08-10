import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * `<select>` nativo, com a mesma moldura do `Input`.
 *
 * Nativo em vez de Radix por três razões: não acrescenta dependência, já vem
 * navegável por teclado e anunciado por leitor de tela, e no celular abre o
 * seletor do sistema — que é melhor do que qualquer lista que se desenhe. O
 * projeto já fazia assim de forma solta em `TimesheetMirrorList`; aqui isso
 * vira primitivo, para o estilo parar de ser copiado de tela em tela.
 *
 * `appearance-none` some com a seta do sistema, que muda de forma entre
 * navegadores; a nossa vem do `background-image` abaixo, igual nos três.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-md border border-input bg-background bg-[length:0.6rem] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        "bg-[image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6' fill='none' stroke='%236f8a91' stroke-width='1.5'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export { Select };
