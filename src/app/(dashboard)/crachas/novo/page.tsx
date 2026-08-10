import { RoleGuard } from "@/components/auth/RoleGuard";
import { BadgeForm } from "@/components/badge/BadgeForm";

/**
 * Emitir é ADMIN e RH. O OPERADOR chega em `/crachas` e no detalhe, onde
 * bloqueia e reporta perda — `batente_operador` não tem `INSERT` em
 * `credentials`, então esta tela seria um formulário que o banco recusaria.
 */
export default function NovoCrachaPage() {
  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <BadgeForm />
    </RoleGuard>
  );
}
