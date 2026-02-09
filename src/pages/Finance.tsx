import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Search,
  Plus,
  Eye,
  Receipt,
  Banknote,
} from "lucide-react";
import { Invoice, InvoiceItem } from "@/types/finance";

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    patientId: "patient-001",
    patientName: "John Smith",
    date: "2024-01-20",
    items: [
      { description: "Cardiology Consultation", category: "consultation", quantity: 1, unitPrice: 150, total: 150 },
      { description: "ECG", category: "lab-test", quantity: 1, unitPrice: 75, total: 75 },
      { description: "Blood Panel", category: "lab-test", quantity: 1, unitPrice: 120, total: 120 },
    ],
    subtotal: 345,
    tax: 0,
    total: 345,
    status: "pending",
  },
  {
    id: "INV-002",
    patientId: "patient-002",
    patientName: "Mary Johnson",
    date: "2024-01-19",
    items: [
      { description: "Neurology Consultation", category: "consultation", quantity: 1, unitPrice: 200, total: 200 },
      { description: "MRI Brain", category: "lab-test", quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 700,
    tax: 0,
    total: 700,
    status: "paid",
    paymentMethod: "insurance",
    paidAt: "2024-01-20",
  },
  {
    id: "INV-003",
    patientId: "patient-003",
    patientName: "Robert Williams",
    date: "2024-01-18",
    items: [
      { description: "Cardiology Consultation", category: "consultation", quantity: 1, unitPrice: 150, total: 150 },
      { description: "Stress Test", category: "lab-test", quantity: 1, unitPrice: 200, total: 200 },
      { description: "Lipid Panel", category: "lab-test", quantity: 1, unitPrice: 80, total: 80 },
      { description: "Atorvastatin 20mg (30 tabs)", category: "medication", quantity: 1, unitPrice: 25, total: 25 },
    ],
    subtotal: 455,
    tax: 0,
    total: 455,
    status: "overdue",
  },
  {
    id: "INV-004",
    patientId: "patient-004",
    patientName: "Jennifer Davis",
    date: "2024-01-17",
    items: [
      { description: "Pediatrics Consultation", category: "consultation", quantity: 1, unitPrice: 100, total: 100 },
    ],
    subtotal: 100,
    tax: 0,
    total: 100,
    status: "paid",
    paymentMethod: "cash",
    paidAt: "2024-01-17",
  },
  {
    id: "INV-005",
    patientId: "patient-005",
    patientName: "David Brown",
    date: "2024-01-21",
    items: [
      { description: "Cardiology Consultation", category: "consultation", quantity: 1, unitPrice: 150, total: 150 },
      { description: "Bed - Room 305 (3 nights)", category: "bed", quantity: 3, unitPrice: 200, total: 600 },
    ],
    subtotal: 750,
    tax: 0,
    total: 750,
    status: "pending",
  },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-3 h-3" />,
  card: <CreditCard className="w-3 h-3" />,
  insurance: <Receipt className="w-3 h-3" />,
  mobile: <DollarSign className="w-3 h-3" />,
};

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);

  const filtered = invoices.filter((inv) => {
    const matchSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleMarkPaid = () => {
    if (!payModalInvoice) return;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payModalInvoice.id
          ? { ...inv, status: "paid" as const, paymentMethod: paymentMethod as Invoice["paymentMethod"], paidAt: new Date().toISOString() }
          : inv
      )
    );
    setPayModalInvoice(null);
  };

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Pending", value: `$${totalPending.toLocaleString()}`, icon: DollarSign, color: "bg-warning/10 text-warning" },
    { label: "Overdue", value: `$${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
    { label: "Invoices", value: invoices.length, icon: Receipt, color: "bg-primary/10 text-primary" },
  ];

  return (
    <DashboardLayout title="Finance & Billing" subtitle="Manage invoices, payments, and revenue tracking">
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
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">Invoices</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="hidden sm:grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
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
                    <TableHead>Invoice</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                        <TableCell className="font-medium">{inv.patientName}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(inv.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{inv.items.length} items</TableCell>
                        <TableCell className="font-semibold">${inv.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusStyles[inv.status]}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(inv)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(inv.status === "pending" || inv.status === "overdue") && (
                              <Button size="sm" variant="outline" onClick={() => setPayModalInvoice(inv)}>
                                Pay
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

        {/* View Invoice Dialog */}
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice?.id}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{selectedInvoice.patientName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={statusStyles[selectedInvoice.status]}>{selectedInvoice.status}</Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <p className="text-sm">{item.description}</p>
                          <Badge variant="outline" className="text-xs mt-0.5">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice}</TableCell>
                        <TableCell className="text-right font-medium">${item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="border-t pt-3 space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Subtotal: ${selectedInvoice.subtotal}</p>
                  <p className="text-lg font-bold">Total: ${selectedInvoice.total}</p>
                </div>

                {selectedInvoice.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {methodIcons[selectedInvoice.paymentMethod]}
                    <span className="capitalize">Paid via {selectedInvoice.paymentMethod}</span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pay Modal */}
        <Dialog open={!!payModalInvoice} onOpenChange={() => setPayModalInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {payModalInvoice && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{payModalInvoice.patientName}</p>
                  <p className="text-2xl font-bold mt-1">${payModalInvoice.total}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="mobile">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPayModalInvoice(null)}>Cancel</Button>
                  <Button onClick={handleMarkPaid}>Confirm Payment</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
