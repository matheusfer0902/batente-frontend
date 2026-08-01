import { RoleGuard } from "@/components/auth/RoleGuard";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";

export default function AuditoriaPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <ModulePlaceholder navKey="auditoria" />
    </RoleGuard>
  );
}
