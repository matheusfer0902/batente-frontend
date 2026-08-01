import { AccessDetail } from "@/components/access/AccessDetail";

export default async function AccessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AccessDetail id={id} />;
}
