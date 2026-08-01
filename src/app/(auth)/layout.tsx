/**
 * Área de entrada do sistema. É sempre escura, independente do tema escolhido:
 * a classe `dark` fixa os tokens para o subtree inteiro.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark entry-grid flex min-h-screen items-center justify-center bg-gun-950 p-4 text-linen entry:p-12">
      {children}
    </div>
  );
}
