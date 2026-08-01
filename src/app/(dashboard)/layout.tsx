import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { Footer } from "@/components/shared/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
