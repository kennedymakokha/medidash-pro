import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface DataTableProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  actionButton?: ReactNode;
  addButton?: ReactNode;
  columns: ReactNode;
  rows: ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable({
  title,
  search,
  onSearchChange,
  actionButton,
  addButton,
  columns,
  rows,
  page,
  totalPages,
  onPageChange,
}: DataTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            {title}
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSearchChange && (
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            {actionButton}
            {addButton}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>{columns}</thead>
          <tbody className="divide-y divide-border">{rows}</tbody>
        </table>

        {/* Pagination */}
        {page && totalPages && onPageChange && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
