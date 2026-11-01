import { redirect } from "next/navigation";

export default async function MarketplaceCharacterRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/characters/${id}`);
}
