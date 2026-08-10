import { RoleGuard } from "@/components/auth/RoleGuard";
import { DeviceForm } from "@/components/device/DeviceForm";

export default function NovoDispositivoPage() {
  return (
    <RoleGuard roles={["ADMIN"]}>
      <DeviceForm />
    </RoleGuard>
  );
}
