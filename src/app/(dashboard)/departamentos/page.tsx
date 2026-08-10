import { RoleGuard } from "@/components/auth/RoleGuard";
import { DepartmentList } from "@/components/department/DepartmentList";

export default function DepartamentosPage() {
  return (
    <RoleGuard roles={["ADMIN", "RH"]}>
      <DepartmentList />
    </RoleGuard>
  );
}
