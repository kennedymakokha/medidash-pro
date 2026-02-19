import { useState, useMemo } from "react";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/table/DataTable";
import { useUpdatelabtestMutation } from "@/features/visitsSlice";

export interface LabOrder {
  id: string;
  patientName: string;
  patientId: string;
  testName: string;
  category: string;
  orderedBy: string;
  orderedAt: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "routine" | "urgent" | "stat";
  result?: string;
  completedAt?: string;
}

interface LabOrdersTableProps {
  orders: LabOrder[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  refetch?: () => void;
  title?: string;
  resultText?:string
  setSelectedOrder: () => void;
  setResultModal: () => void;
  setResultText: () => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  "in-progress": "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

const priorityStyles: Record<string, string> = {
  routine: "bg-muted text-muted-foreground",
  urgent: "bg-warning/10 text-warning",
  stat: "bg-destructive/10 text-destructive",
};

export function LabOrdersTable({
  orders,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
  setSelectedOrder,
  refetch,
  setResultModal,
  setResultText,
  resultText,
  title = "Lab Orders",
}: LabOrdersTableProps) {
  const [updateTest, isLoading] = useUpdatelabtestMutation({});

  const filteredOrders = useMemo(
    () =>
      orders?.filter((o) => {
        const matchSearch =
          o?.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o?.testId?.testName?.toLowerCase().includes(search.toLowerCase()) ||
          o?.uuid?.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
      }),
    [orders, search],
  );
  console.log(filteredOrders);
  const rows = useMemo(
    () =>
      filteredOrders?.map((order) => (
        <tr key={order._id} className="hover:bg-muted/30">
          <td className="px-6 py-4 font-mono">{order.uuid}</td>
          <td className="px-6 py-4 font-medium">
            {" "}
            {order?.visitId?.patientMongoose?.name}
          </td>
          <td className="px-6 py-4">
            <p className="text-sm">{order?.testId?.testName}</p>
            <Badge variant="outline" className="text-xs">
              {order?.testId?.category}
            </Badge>
          </td>
          <td className="px-6 py-4 text-sm text-muted-foreground">
            {order?.visitId?.assignedDoctor?.name}
          </td>
          <td className="px-6 py-4">
            <Badge className={priorityStyles[order.priority]}>
              {order?.priority}
            </Badge>
          </td>
          <td className="px-6 py-4">
            <Badge className={statusStyles[order.status]}>{order.status}</Badge>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedOrder(order)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {order.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await updateTest({
                      visitId: `${order?.visitId?._id}`,
                      testUuid: `${order?.uuid}`,
                      status: "in-progress",
                    });
                    await refetch();
                  }}
                >
                  {!isLoading ? "isLoading..." : "Start"}
                </Button>
              )}
              {order.status === "in-progress" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setResultModal(order);
                    setResultText("");
                  }}
                >
                  <FileText className="w-3 h-3 mr-1" /> Result
                </Button>
              )}
            </div>
          </td>
        </tr>
      )),
    [filteredOrders],
  );

  return (
    <DataTable
      title={title}
      search={search}
      onSearchChange={onSearchChange}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      columns={
        <tr className="bg-muted/50">
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Order ID
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Patient
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Test
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Ordered By
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Priority
          </th>
          <th className="text-left px-6 py-3 text-xs font-semibold uppercase">
            Status
          </th>
          <th className="text-right px-6 py-3 text-xs font-semibold uppercase">
            Actions
          </th>
        </tr>
      }
      rows={rows}
      actionButton={
        refetch && (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        )
      }
    />
  );
}
