import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  variant?: "stats" | "department" | "appointment" | "default";
}

export function CardSkeleton({ variant = "default" }: CardSkeletonProps) {
  if (variant === "stats") {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  if (variant === "department") {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "appointment") {
    return (
      <div className="bg-card rounded-xl p-4 shadow-card animate-pulse border-l-4 border-muted">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card animate-pulse">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant="stats" />
      ))}
    </div>
  );
}

export function DepartmentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant="department" />
      ))}
    </div>
  );
}

export function AppointmentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-pulse">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4">
            <CardSkeleton variant="appointment" />
          </div>
        ))}
      </div>
    </div>
  );
}
