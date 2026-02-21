import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { useFetchvisitlabordersQuery, useUpdatelabtestMutation } from "@/features/visitsSlice";
import { DataTable } from "@/components/table/DataTable";
import { LabOrdersTable } from "@/components/dashboard/LabOrderTable";

interface LabOrder {
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
  notes?: string;
  completedAt?: string;
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

export default function LabOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [resultModal, setResultModal] = useState<LabOrder | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;
 const [updateTest, isLoading] = useUpdatelabtestMutation({});
  const [resultText, setResultText] = useState("");
  const { data: labsData, refetch } = useFetchvisitlabordersQuery({
    page,
    limit,
    search: "",
    status: "",
  });
  const orders = labsData !== undefined ? labsData.data : [];

  const stats = [
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      label: "In Progress",
      value: orders.filter((o) => o.status === "in-progress").length,
      icon: Loader2,
      color: "bg-info/10 text-info",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "completed").length,
      icon: CheckCircle2,
      color: "bg-success/10 text-success",
    },
    {
      label: "Urgent/STAT",
      value: orders.filter((o) => o.priority !== "routine").length,
      icon: AlertCircle,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  const filtered = orders.filter((o) => {
    const matchSearch =
      o?.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o?.testId?.testName?.toLowerCase().includes(search.toLowerCase()) ||
      o?.uuid?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, status: LabOrder["status"]) => {
    // setOrders((prev) =>
    //   prev.map((o) =>
    //     o.id === id
    //       ? {
    //           ...o,
    //           status,
    //           ...(status === "completed"
    //             ? { completedAt: new Date().toISOString() }
    //             : {}),
    //         }
    //       : o,
    //   ),
    // );
  };

  const handleSubmitResult = async () => {
    if (!resultModal) return;

    await updateTest({
      visitId: `${resultModal?.visitId?._id}`,
      testUuid: `${resultModal?.uuid}`,
      status: "completed",
      results: resultText,
      completedAt: new Date().toISOString(),
    });
    await refetch()
    // setOrders((prev) =>
    //   prev.map((o) =>
    //     o.id === resultModal.id
    //       ? {
    //           ...o,
    //           status: "completed" as const,
    //           result: resultText,
    //           completedAt: new Date().toISOString(),
    //         }
    //       : o,
    //   ),
    // );
    setResultModal(null);
    setResultText("");
  };
  const handleOpenView = () => {};
  return (
    <DashboardLayout
      title="Lab Orders"
      subtitle="Track and manage laboratory test orders and results"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <LabOrdersTable
          orders={orders} // your fetched lab orders
          search={search}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          page={page}
          setSelectedOrder={setSelectedOrder}
          setResultModal={setResultModal}
          setResultText={setResultText}
          resultText={resultText}
          totalPages={labsData?.pagination?.totalPages ?? 1}
          onPageChange={setPage}
          refetch={()=>refetch()}
        />

        {/* View Order Dialog */}
        <Dialog
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lab Order {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {selectedOrder.patientName}
                  </span>
                  <Badge className={statusStyles[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Test</p>
                    <p className="font-medium">
                      {selectedOrder?.testId?.testName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="capitalize">
                      {selectedOrder?.testId?.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ordered By</p>
                    <p>{selectedOrder?.visitId?.assignedDoctor?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <Badge className={priorityStyles[selectedOrder.priority]}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ordered At</p>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedOrder.completedAt && (
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p>
                        {new Date(selectedOrder.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {selectedOrder.result && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Result
                    </p>
                    <p className="text-sm">{selectedOrder.result}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Submit Result Dialog */}
        <Dialog open={!!resultModal} onOpenChange={() => setResultModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Result — {resultModal?.testName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Patient: {resultModal?.patientName}
              </p>
              <div>
                <Label>Result</Label>
                <Textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Enter test results..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResultModal(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitResult}
                  disabled={!resultText.trim()}
                >
                  Submit Result
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
