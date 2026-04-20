import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="h-[320px] lg:col-span-2 rounded-xl" />
        <Skeleton className="h-[320px] lg:col-span-3 rounded-xl" />
      </div>
      <Skeleton className="h-[180px] rounded-xl" />
    </div>
  );
}
