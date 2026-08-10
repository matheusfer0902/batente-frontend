import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeList } from "@/components/employee/EmployeeList";

export default function ColaboradoresPage() {
  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <EmployeeList />
    </RoleGuard>
  );
}
