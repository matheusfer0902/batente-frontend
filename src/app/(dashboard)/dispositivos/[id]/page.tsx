import { RoleGuard } from "@/components/auth/RoleGuard";
import { DeviceDetailView } from "@/components/device/DeviceDetailView";

export default async function DispositivoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RoleGuard roles={["ADMIN"]}>
      <DeviceDetailView id={id} />
    </RoleGuard>
  );
}
