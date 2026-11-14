import { Skeleton } from "@/components/ui/skeleton";

export function MenuItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-w-0 gap-4 rounded-3xl border border-foodie-line bg-white/60 p-4"
    >
      <div className="min-w-0 flex-1 py-1">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-3 h-5 w-16" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
      <Skeleton className="size-24 shrink-0 self-center rounded-2xl sm:size-28" />
    </div>
  );
}

export default function KitchenMenuSkeleton() {
  return (
    <div role="status" aria-label="Loading kitchen menu">
      <Skeleton className="h-48 rounded-none sm:h-64 sm:rounded-[32px] lg:h-72" />
      <Skeleton className="relative mx-auto -mt-11 size-22 rounded-full border-[5px] border-foodie-paper sm:-mt-13 sm:size-26" />
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-3 sm:pt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-10 w-56" />
        <Skeleton className="mt-2 h-4 w-4/5 max-w-xs" />
        <Skeleton className="mt-3 mb-2 h-5 w-3/4 max-w-sm" />
      </div>
      <div className="mx-4 mt-4 flex gap-2 overflow-hidden p-2 sm:mx-0">
        {[56, 148, 90].map((width) => (
          <Skeleton
            key={width}
            className="h-11 shrink-0 rounded-full"
            style={{ width }}
          />
        ))}
      </div>
      <div className="px-6 pt-6 sm:px-0">
        <Skeleton className="mb-4 h-7 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <MenuItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
