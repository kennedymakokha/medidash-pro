import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "./TableSkeleton";
import { StatsGridSkeleton, DepartmentGridSkeleton, AppointmentListSkeleton } from "./CardSkeleton";

interface PageSkeletonProps {
  variant?: "table" | "cards" | "dashboard" | "form" | "grid";
}

export function PageSkeleton({ variant = "table" }: PageSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-8 animate-pulse">
        <StatsGridSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AppointmentListSkeleton />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
        <DepartmentGridSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="space-y-6 animate-pulse">
        <StatsGridSkeleton />
        <DepartmentGridSkeleton count={9} />
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="space-y-6 animate-pulse">
        <StatsGridSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <Skeleton className="h-8 w-48" />
        <div className="bg-card rounded-xl p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // Default: table variant
  return (
    <div className="space-y-6 animate-pulse">
      <StatsGridSkeleton />
      <TableSkeleton />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-muted' : 'bg-primary/10'} rounded-lg p-3`}>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VitalsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <StatsGridSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BedsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <StatsGridSkeleton />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, wardIndex) => (
          <div key={wardIndex} className="bg-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, bedIndex) => (
                <Skeleton key={bedIndex} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConsultationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <StatsGridSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
