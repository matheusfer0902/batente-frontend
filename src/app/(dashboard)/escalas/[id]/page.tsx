import { RoleGuard } from "@/components/auth/RoleGuard";
import { ScheduleDetailView } from "@/components/schedule/ScheduleDetailView";

// Next 16: `params` é uma Promise nas páginas do App Router.
export default async function EscalaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <ScheduleDetailView id={id} />
    </RoleGuard>
  );
}
