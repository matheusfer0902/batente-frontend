import { RoleGuard } from "@/components/auth/RoleGuard";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";

export default function ConfiguracoesPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <ModulePlaceholder navKey="configuracoes" />
    </RoleGuard>
  );
}
