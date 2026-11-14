import { Skeleton } from "@/components/ui/skeleton";

export function CategoryPillsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading food categories"
      className="scrollbar-hide flex gap-2 overflow-x-auto py-2"
    >
      {[56, 72, 148, 120, 128].map((width, index) => (
        <Skeleton
          key={index}
          className="h-11 shrink-0 rounded-full"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export function KitchenCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-3xl border border-foodie-line bg-white/60"
    >
      <Skeleton className="aspect-[2.5] rounded-none sm:aspect-[2.4]" />
      <div className="relative px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
        <div className="-mt-10 mb-2 flex items-end justify-between gap-3">
          <Skeleton className="size-14 rounded-full border-4 border-foodie-paper sm:size-16" />
          <Skeleton className="mb-1 h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-[22px] w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </div>
    </div>
  );
}

export function MealCollectionSkeleton({
  title = "On the menu near you",
  grid = false,
}: {
  title?: string;
  grid?: boolean;
}) {
  return (
    <section
      role="status"
      aria-label={`Loading ${title.toLowerCase()}`}
      className="mt-9 border-t border-foodie-line pt-7"
    >
      <h2 className="text-xl font-medium tracking-[-.035em] sm:text-2xl">
        {title}
      </h2>
      <Skeleton className="mt-2 mb-4 h-4 w-52" />
      <div
        className={
          grid
            ? "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4"
            : "scrollbar-hide flex gap-4 overflow-x-auto pt-1 pb-4 sm:gap-5"
        }
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className={`${grid ? "min-w-0" : "w-[70vw] max-w-64 shrink-0 sm:w-64"} overflow-hidden rounded-3xl border border-foodie-line bg-white/60`}
          >
            <Skeleton className="aspect-[1.45] rounded-none" />
            <div className="p-4">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="mt-2 h-4 w-3/5" />
              <Skeleton className="mt-3 h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
