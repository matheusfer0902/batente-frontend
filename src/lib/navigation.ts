import type { UserRole } from "@/types/auth";

/**
 * Mapa da navegação do painel. Dados puros, sem React: o middleware importa
 * este módulo no edge para saber o que é rota protegida.
 */

/** Contadores que a sidebar exibe ao lado do item. */
export type NavBadge = "pending" | "adjustments";

export interface NavItem {
  /** Chave no namespace `nav`. Também identifica a rota nos placeholders. */
  key: string;
  href: string;
  /** Sem `roles`, o item é visível para qualquer papel autenticado. */
  roles?: readonly UserRole[];
  badge?: NavBadge;
  /** Ponto de "ao vivo" — o monitor atualiza sozinho. */
  live?: boolean;
}

export interface NavGroup {
  /** Chave do rótulo do grupo; ausente no primeiro bloco, que não tem título. */
  labelKey?: string;
  /** Exibe o selo ADMIN ao lado do título do grupo. */
  adminBadge?: boolean;
  items: readonly NavItem[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    items: [
      { key: "inicio", href: "/inicio" },
      { key: "monitor", href: "/monitor", live: true },
    ],
  },
  {
    labelKey: "groups.people",
    items: [
      { key: "colaboradores", href: "/colaboradores" },
      { key: "departamentos", href: "/departamentos" },
      { key: "crachas", href: "/crachas" },
      { key: "escalas", href: "/escalas" },
    ],
  },
  {
    labelKey: "groups.timekeeping",
    items: [
      { key: "pendencias", href: "/pendencias", badge: "pending" },
      { key: "espelho", href: "/espelho" },
      { key: "ajustes", href: "/ajustes", badge: "adjustments" },
      { key: "fechamento", href: "/fechamento" },
      { key: "bancoDeHoras", href: "/banco-de-horas" },
      { key: "ausencias", href: "/ausencias" },
    ],
  },
  {
    labelKey: "groups.system",
    adminBadge: true,
    items: [
      { key: "dispositivos", href: "/dispositivos", roles: ["ADMIN"] },
      { key: "historico", href: "/historico" },
      { key: "auditoria", href: "/auditoria", roles: ["ADMIN"] },
      { key: "relatorios", href: "/relatorios" },
      { key: "usuarios", href: "/usuarios", roles: ["ADMIN"] },
      { key: "configuracoes", href: "/configuracoes", roles: ["ADMIN"] },
    ],
  },
];

/** Rotas do painel que não aparecem na navegação. */
const EXTRA_PROTECTED_PATHS = ["/acessos", "/portaria"] as const;

export const PROTECTED_PATHS: readonly string[] = [
  ...NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href)),
  ...EXTRA_PROTECTED_PATHS,
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** Papéis exigidos por uma rota, quando houver. */
export function findNavItemByPath(pathname: string): NavItem | undefined {
  return NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
