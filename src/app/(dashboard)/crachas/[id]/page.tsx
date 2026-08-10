import { RoleGuard } from "@/components/auth/RoleGuard";
import { BadgeDetailView } from "@/components/badge/BadgeDetailView";

/**
 * OPERADOR entra: é aqui que a portaria bloqueia um crachá perdido. A divisão
 * fina — bloqueia sim, revoga não — é da rota do backend e do `GRANT`, não deste
 * guarda.
 */
export default async function CrachaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RoleGuard roles={["ADMIN", "RH", "OPERADOR"]}>
      <BadgeDetailView id={id} />
    </RoleGuard>
  );
}
