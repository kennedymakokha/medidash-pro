import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
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
import { useFetchpatientsQuery } from "@/features/patientSlice";
import { useDebounce } from "@/hooks/use-debounce";
import { timeSince } from "@/utils/timeslice";
import {
  useCreatepaymentMutation,
  useFetchpaymentsQuery,
} from "@/features/paymentSlice";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [search, setSearch] = useState("");
  const [postPayment] = useCreatepaymentMutation({});
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading, isFetching, refetch } = useFetchpaymentsQuery({
    page,
    limit,
    track: "billing",
    search: debouncedSearch,
  });
  const invoices = data !== undefined ? data.data : [];

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.total, 0);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv?.patientId?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv?.patientId?._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv?.status === statusFilter;
    return matchSearch && matchStatus;
  });
 
  const handleMarkPaid = async () => {
    if (!payModalInvoice) return;

    const track = payModalInvoice?.patientId?.track;

    const trackMap: Record<string, { field: string; next: string }> = {
      lab_billing: {
        field: "labFeepaidAt",
        next: "lab",
      },
      reg_billing: {
        field: "consultationFeepaidAt",
        next: "triage",
      },
      med_billing: {
        field: "medFeepaidAt",
        next: "pharmacy",
      },
    };

    const config = trackMap[track];

    if (!config) return;

    const payload: any = {
      uuid: payModalInvoice.uuid,
      patientId: payModalInvoice.patientId._id,
      visitId: payModalInvoice.visitId._id,
      status: "paid",
      track: config.next,
      [config.field]: new Date(), // dynamic field assignment
    };

    try {
      await postPayment(payload).unwrap();
      await refetch();

      toast({
        title: "Payment Successful",
        description: "Payment has been made successfully.",
      });

      setPayModalInvoice(null);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong while processing payment.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
    },
    {
      label: "Pending",
      value: `$${totalPending.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Overdue",
      value: `$${totalOverdue.toLocaleString()}`,
      icon: AlertCircle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      label: "Invoices",
      value: invoices.length,
      icon: Receipt,
      color: "bg-primary/10 text-primary",
    },
  ];
  const VAT_RATE = 0.16;

  const items = selectedInvoice?.visitId?.prescribedTests ?? [];

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;
  for (let index = 0; index < filtered.length; index++) {
    const element = filtered[index];
    console.log(element?.patientId?.track);
  }
  return (
    <DashboardLayout
      title="Finance & Billing"
      subtitle="Manage invoices, payments, and revenue tracking"
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
                    <TableHead className="hidden sm:table-cell">
                      Items
                    </TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inv) => (
                      <TableRow key={inv?._id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm">
                          {inv?.uuid}
                        </TableCell>
                        <TableCell className="font-medium">
                          {inv?.patientId?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(inv?.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {inv?.patientId?.track === "reg_billing"
                            ? "Consultation Fee"
                            : inv?.patientId?.track === "lab_billing"
                              ? `${inv?.visitId?.prescribedTests?.length ?? 0} lab test items`
                              : ""}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {(() => {
                            if (inv?.patientId?.track === "reg_billing") {
                              return inv?.consultationFee?.toLocaleString();
                            }

                            const tests = inv?.visitId?.prescribedTests ?? [];
                            const medications = inv?.visitId?.medications ?? [];

                            const testsTotal = tests.reduce((sum, item) => {
                              return sum + Number(item.price || 0);
                            }, 0);

                            const medsTotal = medications.reduce(
                              (sum, item) => {
                                return sum + Number(item.price || 0);
                              },
                              0,
                            );

                            if (inv?.patientId?.track === "lab_billing") {
                              return testsTotal.toLocaleString();
                            }

                            if (inv?.patientId?.track === "med_billing") {
                              return (testsTotal + medsTotal).toLocaleString();
                            }

                            return inv?.total?.toLocaleString() || "";
                          })()}
                        </TableCell>

                        <TableCell>
                          <Badge className={statusStyles[inv?.status]}>
                            {inv?.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPayModalInvoice(inv);
                                console.log(inv);
                              }}
                            >
                              Pay
                            </Button>
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
        <Dialog
          open={!!selectedInvoice}
          onOpenChange={() => setSelectedInvoice(null)}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedInvoice?.uuid}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{selectedInvoice.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {timeSince(selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <Badge className={statusStyles[selectedInvoice.status]}>
                    {selectedInvoice.status}
                  </Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>

                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice?.visitId?.prescribedTests?.map(
                      (item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <p className="text-sm">{item.description}</p>
                            <Badge variant="outline" className="text-xs mt-0.5">
                              {item.testName}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            {item.price}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>

                <div className="border-t pt-3 space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">
                    Subtotal: Ksh{subtotal?.toFixed(2)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    VAT (16%): Ksh{vat?.toFixed(2)}
                  </p>

                  <p className="text-lg font-bold">
                    Total: Ksh{total?.toFixed(2)}
                  </p>
                </div>

                {selectedInvoice.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {methodIcons[selectedInvoice.paymentMethod]}
                    <span className="capitalize">
                      Paid via {selectedInvoice.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Pay Modal */}
        <Dialog
          open={!!payModalInvoice}
          onOpenChange={() => setPayModalInvoice(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            {payModalInvoice && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">
                    {payModalInvoice?.patientId?.name}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    Ksh
                    {payModalInvoice?.patientId?.track === "lab_billing"
                      ? payModalInvoice?.labFee
                      : payModalInvoice?.patientId?.track === "reg_billing"
                        ? payModalInvoice?.consultationFee
                        : payModalInvoice?.medFee}
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="mobile">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPayModalInvoice(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleMarkPaid}>
                    Confirm{" "}
                    {payModalInvoice?.patientId?.track === "lab_billing"
                      ? "Lab Tests payments"
                      : payModalInvoice?.patientId?.track === "reg_billing"
                        ? "Registration"
                        : "Medication"}{" "}
                    Payment
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
