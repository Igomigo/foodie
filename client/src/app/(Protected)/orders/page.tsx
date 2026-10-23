import { ShoppingBag } from "lucide-react";
import BrandButton from "@/components/shared/BrandButton";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[850px] py-4">
      <p className="mb-3 text-[10px] font-semibold tracking-[.16em] text-foodie-action uppercase">
        Your table
      </p>
      <h1 className="text-4xl font-medium tracking-[-.05em] sm:text-5xl">
        Good meals. Great memories.
      </h1>
      <div className="mt-10 rounded-[32px] border border-foodie-line bg-[#eef0e6] px-7 py-16 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-foodie-paper text-foodie-forest">
          <ShoppingBag size={34} strokeWidth={1.2} aria-hidden="true" />
        </span>
        <h2 className="mt-7 text-2xl font-medium tracking-tight">
          Your first food story starts here.
        </h2>
        <p className="mx-auto mt-4 max-w-[330px] text-xs leading-[1.9] text-foodie-muted">
          Ordering is coming as local kitchens join Foodie. For now, explore the
          flavours you’ll be coming back for.
        </p>
        <BrandButton href="/home#cravings" size="compact" className="mt-7">
          Explore food
        </BrandButton>
      </div>
    </div>
  );
}
