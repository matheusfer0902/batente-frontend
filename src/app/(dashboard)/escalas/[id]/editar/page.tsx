import { RoleGuard } from "@/components/auth/RoleGuard";
import { ScheduleEditPage } from "@/components/schedule/ScheduleEditPage";

export default async function EditarEscalaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <ScheduleEditPage id={id} />
    </RoleGuard>
  );
}
