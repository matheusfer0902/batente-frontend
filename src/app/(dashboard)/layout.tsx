import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MobileNav } from "@/components/shared/MobileNav";
import { Sidebar } from "@/components/shared/Sidebar";

/**
 * Casca do painel: sidebar + conteúdo. Sem rodapé — o design do Bloco 2 não
 * tem um, e a área vertical é do conteúdo.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gun text-linen">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <MobileNav />
          <main className="flex min-w-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
