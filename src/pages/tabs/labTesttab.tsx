import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabsContent } from "@/components/ui/tabs";
import { useCreatelabMutation } from "@/features/labTestSlice";
import { cn } from "@/lib/utils";
import { LabTest } from "@/types/billing";
import { AlertCircle, Clock, Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { DataTable } from "@/components/table/DataTable";
import { LabFormModal } from "@/components/modals/LabTestForm";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

interface LabTableProps {
  filteredTests: LabTest[];
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
export function LabTable({
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
}: LabTableProps) {
  const [editLab, setEditLab] = useState<LabTest | null>(null);
  const [deleteLabData, setDeleteLabData] = useState<LabTest | null>(null);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [postLab] = useCreatelabMutation();
  const deleteLab = async (Lab: LabTest | null) => {
    if (!Lab) return;
    try {
      await postLab({ ...Lab, isDeleted: true }).unwrap();
      await refetch();
      setDeleteLabData(null);
    } catch (error) {
      console.error("Failed to delete Lab", error);
    }
  };
  const testCategoryStyles = {
    blood: "bg-destructive/10 text-destructive",
    urine: "bg-warning/10 text-warning",
    imaging: "bg-info/10 text-info",
    pathology: "bg-primary/10 text-primary",
    other: "bg-muted text-muted-foreground",
  };
  const addLab = async (Data: LabTest) => {
    await postLab(Data).unwrap();
    await refetch();
    toast({
      title: `${Data.uuid !== undefined ? "Update Lab" : "Lab Added"}`,
      description: `${Data.testName} ${Data.uuid ? "has been Updated" : "has been added"} successfully.`,
    });
  };
  return (
    <TabsContent value="tests">
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
              setEditLab(null);
              setIsLabModalOpen(true);
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
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Test Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Category
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden md:table-cell">
              Turnaround
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Price
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase hidden sm:table-cell">
              Fasting
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase">
              Status
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold uppercase">
              Actions
            </th>
          </tr>
        }
        rows={filteredTests.map((test: LabTest) => (
          <tr key={test.uuid} className="hover:bg-muted/30">
            <td className="px-4 py-3">
              <p className="font-medium">{test.testName}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {test.description}
              </p>
            </td>
            <td className="px-4 py-3">
              <Badge
                className={cn("capitalize", testCategoryStyles[test.category])}
              >
                {test.category}
              </Badge>
            </td>
            <td className="px-4 py-3 hidden md:table-cell">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {test.turnaroundTime}
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="font-semibold">${test.price}</span>
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
              {test.requiresFasting && (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Yes
                </Badge>
              )}
            </td>
            <td className="px-4 py-3">
              <Badge
                variant={test.status === "active" ? "default" : "secondary"}
              >
                {test.status}
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
                      setEditLab(test);
                      setIsLabModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteLabData(test)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      />

      <LabFormModal
        open={isLabModalOpen}
        onOpenChange={setIsLabModalOpen}
        lab={editLab}
        mode={editLab ? "edit" : "add"}
        onSubmit={addLab}
      />

      <DeleteConfirmModal
        title="Delete Lab Test"
        description={`Are you sure you want to delete ${deleteLabData?.testName}?`}
        open={!!deleteLabData}
        onOpenChange={() => setDeleteLabData(null)}
        onConfirm={() => deleteLab(deleteLabData)}
      />
    </TabsContent>
  );
}
