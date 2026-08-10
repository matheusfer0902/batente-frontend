import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeForm } from "@/components/employee/EmployeeForm";

export default function NovoColaboradorPage() {
  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <EmployeeForm />
    </RoleGuard>
  );
}
