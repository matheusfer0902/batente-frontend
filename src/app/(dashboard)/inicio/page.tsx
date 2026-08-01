import { Suspense } from "react";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default function InicioPage() {
  // Suspense: a tela lê `?cenario=` da URL para as demonstrações do mock.
  return (
    <Suspense>
      <DashboardHome />
    </Suspense>
  );
}
