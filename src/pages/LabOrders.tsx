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

const mockLabOrders: LabOrder[] = [
  { id: "LO-001", patientName: "John Smith", patientId: "patient-001", testName: "ECG", category: "imaging", orderedBy: "Dr. Michael Chen", orderedAt: "2024-01-20T09:30:00Z", status: "pending", priority: "urgent" },
  { id: "LO-002", patientName: "John Smith", patientId: "patient-001", testName: "Blood Panel", category: "blood", orderedBy: "Dr. Michael Chen", orderedAt: "2024-01-20T09:30:00Z", status: "in-progress", priority: "routine" },
  { id: "LO-003", patientName: "Mary Johnson", patientId: "patient-002", testName: "MRI Brain", category: "imaging", orderedBy: "Dr. Sarah Lee", orderedAt: "2024-01-19T14:15:00Z", status: "pending", priority: "urgent" },
  { id: "LO-004", patientName: "Mary Johnson", patientId: "patient-002", testName: "Blood Sugar", category: "blood", orderedBy: "Dr. Sarah Lee", orderedAt: "2024-01-19T14:15:00Z", status: "completed", priority: "routine", result: "Normal - 95 mg/dL", completedAt: "2024-01-19T16:00:00Z" },
  { id: "LO-005", patientName: "Robert Williams", patientId: "patient-003", testName: "Stress Test", category: "imaging", orderedBy: "Dr. Michael Chen", orderedAt: "2024-01-18T10:00:00Z", status: "completed", priority: "routine", result: "Normal", completedAt: "2024-01-18T12:00:00Z" },
  { id: "LO-006", patientName: "Robert Williams", patientId: "patient-003", testName: "Lipid Panel", category: "blood", orderedBy: "Dr. Michael Chen", orderedAt: "2024-01-18T10:00:00Z", status: "completed", priority: "routine", result: "Elevated cholesterol - 260 mg/dL", completedAt: "2024-01-18T11:30:00Z" },
  { id: "LO-007", patientName: "David Brown", patientId: "patient-005", testName: "Chest X-Ray", category: "imaging", orderedBy: "Dr. Michael Chen", orderedAt: "2024-01-21T08:00:00Z", status: "in-progress", priority: "stat" },
];

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
  const [orders, setOrders] = useState<LabOrder[]>(mockLabOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [resultModal, setResultModal] = useState<LabOrder | null>(null);
  const [resultText, setResultText] = useState("");

  const stats = [
    { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "In Progress", value: orders.filter((o) => o.status === "in-progress").length, icon: Loader2, color: "bg-info/10 text-info" },
    { label: "Completed", value: orders.filter((o) => o.status === "completed").length, icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Urgent/STAT", value: orders.filter((o) => o.priority !== "routine").length, icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
  ];

  const filtered = orders.filter((o) => {
    const matchSearch = o.patientName.toLowerCase().includes(search.toLowerCase()) || o.testName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, status: LabOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status, ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}) } : o))
    );
  };

  const handleSubmitResult = () => {
    if (!resultModal) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === resultModal.id ? { ...o, status: "completed" as const, result: resultText, completedAt: new Date().toISOString() } : o
      )
    );
    setResultModal(null);
    setResultText("");
  };

  return (
    <DashboardLayout title="Lab Orders" subtitle="Track and manage laboratory test orders and results">
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
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">Lab Orders</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="hidden sm:grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="in-progress">Active</TabsTrigger>
                    <TabsTrigger value="completed">Done</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead className="hidden md:table-cell">Ordered By</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No lab orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell className="font-medium">{order.patientName}</TableCell>
                        <TableCell>
                          <p className="text-sm">{order.testName}</p>
                          <Badge variant="outline" className="text-xs">{order.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{order.orderedBy}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={priorityStyles[order.priority]}>{order.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyles[order.status]}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === "pending" && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, "in-progress")}>
                                Start
                              </Button>
                            )}
                            {order.status === "in-progress" && (
                              <Button size="sm" onClick={() => { setResultModal(order); setResultText(""); }}>
                                <FileText className="w-3 h-3 mr-1" /> Result
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Order Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lab Order {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">{selectedOrder.patientName}</span>
                  <Badge className={statusStyles[selectedOrder.status]}>{selectedOrder.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground">Test</p><p className="font-medium">{selectedOrder.testName}</p></div>
                  <div><p className="text-muted-foreground">Category</p><p className="capitalize">{selectedOrder.category}</p></div>
                  <div><p className="text-muted-foreground">Ordered By</p><p>{selectedOrder.orderedBy}</p></div>
                  <div><p className="text-muted-foreground">Priority</p><Badge className={priorityStyles[selectedOrder.priority]}>{selectedOrder.priority}</Badge></div>
                  <div><p className="text-muted-foreground">Ordered At</p><p>{new Date(selectedOrder.orderedAt).toLocaleString()}</p></div>
                  {selectedOrder.completedAt && <div><p className="text-muted-foreground">Completed</p><p>{new Date(selectedOrder.completedAt).toLocaleString()}</p></div>}
                </div>
                {selectedOrder.result && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Result</p>
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
              <p className="text-sm text-muted-foreground">Patient: {resultModal?.patientName}</p>
              <div>
                <Label>Result</Label>
                <Textarea value={resultText} onChange={(e) => setResultText(e.target.value)} placeholder="Enter test results..." rows={4} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResultModal(null)}>Cancel</Button>
                <Button onClick={handleSubmitResult} disabled={!resultText.trim()}>Submit Result</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
