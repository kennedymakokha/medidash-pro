import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabsContent } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { Procedure } from "@/types/billing";
import { AlertCircle, Clock, Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { DataTable } from "@/components/table/DataTable";

import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useCreateproceduresMutation } from "@/features/procedureSlice";
import { ProcedureFormModal } from "@/components/modals/ProcedureForm";

interface ProcedureTableProps {
  filteredTests: Procedure[];
  title: string;
  viewAll?: () => void;
  viewPaginated: () => void;
  refetch?: () => void;
  page: number;
  limit?: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
}
export function ProcedureTable({
  filteredTests,
  title,
  page,
  totalPages,
  limit,
  viewPaginated,
  viewAll,
  onPageChange,
  search,
  onSearchChange,
  refetch,
}: ProcedureTableProps) {
  const [editProcedure, setEditProcedure] = useState<Procedure | null>(null);
  const [deleteProcedureData, setDeleteProcedureData] =
    useState<Procedure | null>(null);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [postProcedure] = useCreateproceduresMutation();
  const deleteProcedure = async (Procedure: Procedure | null) => {
    if (!Procedure) return;
    try {
      await postProcedure({ ...Procedure, isDeleted: true }).unwrap();
      await refetch();
      setDeleteProcedureData(null);
    } catch (error) {
      console.error("Failed to delete Procedure", error);
    }
  };
  const procedureCategoryStyles = {
    minor: "bg-success/10 text-success",
    major: "bg-destructive/10 text-destructive",
    diagnostic: "bg-info/10 text-info",
    therapeutic: "bg-primary/10 text-primary",
  };
  const addProcedure = async (Data: Procedure) => {
    await postProcedure(Data).unwrap();
    await refetch();
    toast({
      title: `${Data.uuid !== undefined ? "Update Procedure" : "Procedure Added"}`,
      description: `${Data.procedureName} ${Data.uuid ? "has been Updated" : "has been added"} successfully.`,
    });
  };
  return (
    <TabsContent value="procedures">
      <DataTable
        title={title}
        search={search}
        onSearchChange={onSearchChange}
        actionButton={
          <Button
            variant="outline"
            onClick={() => {
              if (limit > 10) {
                viewPaginated();
              } else {
                viewAll();
              }
              refetch();
            }}
            size="sm"
          >
            {limit > 100 ? "View Paginated" : "View All"}
          </Button>
        }
        addButton={
          <Button
            // variant="outline"
            onClick={() => {
              setEditProcedure(null);
              setIsProcedureModalOpen(true);
            }}
            size="sm"
          >
            New
          </Button>
        }
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        columns={
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Procedure Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell">
              Duration
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Price
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden sm:table-cell">
              Anesthesia
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Status
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold uppercase">
              Actions
            </th>
          </tr>
        }
        rows={filteredTests?.map((proc: Procedure) => (
          <tr key={proc.uuid} className="hover:bg-muted/30">
            <td className="px-4 py-3">
              <p className="font-medium">{proc.procedureName}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {proc.description}
              </p>
            </td>
            <td className="px-4 py-3">
              <Badge
                className={cn(
                  "capitalize",
                  procedureCategoryStyles[proc.category],
                )}
              >
                {proc.category}
              </Badge>
            </td>
            <td className="px-4 py-3 hidden md:table-cell">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {proc.duration}
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="font-semibold">${proc.price}</span>
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
              {proc.requiresAnesthesia && (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Required
                </Badge>
              )}
            </td>
            <td className="px-4 py-3">
              <Badge
                variant={proc.status === "active" ? "default" : "secondary"}
              >
                {proc.status}
              </Badge>
            </td>
            <td className="px-4 py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditProcedure(proc);
                      setIsProcedureModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteProcedureData(proc)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      />

      <ProcedureFormModal
        open={isProcedureModalOpen}
        onOpenChange={setIsProcedureModalOpen}
        data={editProcedure}
        mode={editProcedure ? "edit" : "add"}
        onSubmit={addProcedure}
      />

      <DeleteConfirmModal
        title="Delete Procedure Test"
        description={`Are you sure you want to delete ${deleteProcedureData?.procedureName}?`}
        open={!!deleteProcedureData}
        onOpenChange={() => setDeleteProcedureData(null)}
        onConfirm={() => deleteProcedure(deleteProcedureData)}
      />
    </TabsContent>
  );
}
