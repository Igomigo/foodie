import { Suspense } from "react";
import KitchenMenu from "@/components/kitchens/KitchenMenu";

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <p role="status" className="py-12 text-sm text-foodie-muted">
          Loading the menu…
        </p>
      }
    >
      <KitchenMenu key={id} id={id} />
    </Suspense>
  );
}
