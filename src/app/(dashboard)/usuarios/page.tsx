import { RoleGuard } from "@/components/auth/RoleGuard";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";

export default function UsuariosPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <ModulePlaceholder navKey="usuarios" />
    </RoleGuard>
  );
}
