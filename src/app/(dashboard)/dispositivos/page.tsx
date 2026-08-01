import { RoleGuard } from "@/components/auth/RoleGuard";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";

export default function DispositivosPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <ModulePlaceholder navKey="dispositivos" />
    </RoleGuard>
  );
}
