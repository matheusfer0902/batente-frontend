import { RoleGuard } from "@/components/auth/RoleGuard";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";

export default function NovaEscalaPage() {
  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <ScheduleForm />
    </RoleGuard>
  );
}
