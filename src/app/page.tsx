import { redirect } from "next/navigation";

/**
 * Raiz do site.
 *
 * Antes, lia os cookies `auth-token`/`auth-role` no servidor para mandar quem
 * já tinha sessão direto ao painel. Não é mais possível: a API está em outro
 * domínio, então esses cookies nunca chegam ao servidor do Next — e decidir
 * rota a partir de um papel enviado pelo cliente era frágil de todo modo.
 *
 * Manda todos para `/login`; a própria tela redireciona ao destino do papel
 * quando `GET /auth/me` confirma que já existe sessão.
 */
export default function HomePage() {
  redirect("/login");
}
