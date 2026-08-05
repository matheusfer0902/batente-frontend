import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * O middleware **não decide mais autenticação** — e não é uma simplificação
 * preguiçosa, é consequência direta da topologia.
 *
 * Antes, ele lia os cookies `auth-token` e `auth-role` no edge para redirecionar
 * e resolver o destino pós-login. Isso deixou de ser possível por dois motivos
 * independentes:
 *
 * 1. **Cross-site.** A API está em outro domínio, e o edge do Next só recebe
 *    cookies da própria origem. Os cookies de sessão simplesmente não chegam
 *    aqui, então não há o que ler.
 * 2. **Não seria confiável nem se chegassem.** Presença de cookie não é prova
 *    de sessão válida — qualquer um escreve um cookie chamado `auth-token`. E
 *    `auth-role` como base de decisão era pior: papel vindo do cliente.
 *
 * A proteção real acontece em dois lugares, ambos preservados: o servidor
 * revalida identidade e papel em toda requisição, e o `ProtectedRoute` cuida da
 * experiência a partir de `GET /auth/me`.
 *
 * Custo aceito: quem não está logado vê um instante de carregamento antes do
 * redirecionamento, em vez de ser barrado no edge. A alternativa — um proxy de
 * mesma origem no Next — devolveria o redirecionamento no edge e ainda
 * eliminaria o cookie de terceiros; vale reconsiderar se o ITP do Safari se
 * tornar um problema.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Mantido para que reativar regras de edge (locale, cabeçalhos) não exija
  // redescobrir o matcher.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
