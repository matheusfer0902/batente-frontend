import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeEditPage } from "@/components/employee/EmployeeEditPage";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <EmployeeEditPage id={id} />
    </RoleGuard>
  );
}
