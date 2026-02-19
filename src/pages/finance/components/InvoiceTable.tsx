import { Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types/finance";

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

interface Props {
  invoices: Invoice[];
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onView: (inv: Invoice) => void;
  onPay: (inv: Invoice) => void;
}

function resolveTotal(inv: Invoice): string {
  const track = inv?.patientId?.track;
  if (track === "reg_billing") return (inv?.consultationFee ?? 0).toLocaleString();
  const tests = inv?.visitId?.prescribedTests ?? [];
  const meds = inv?.visitId?.medications ?? [];
  const testsTotal = tests.reduce((s, t) => s + Number(t.price || 0), 0);
  const medsTotal = meds.reduce((s, m) => s + Number(m.price || 0), 0);
  if (track === "lab_billing") return testsTotal.toLocaleString();
  if (track === "med_billing") return (testsTotal + medsTotal).toLocaleString();
  return inv?.total?.toLocaleString() ?? "";
}

function resolveItems(inv: Invoice): string {
  const track = inv?.track;
  if (track === "reg_billing") return "Consultation Fee";
  if (track === "lab_billing") return `${inv?.visitId?.prescribedTests?.length ?? 0} lab test items`;
  return "";
}

export function InvoiceTable({ invoices, search, onSearchChange, statusFilter, onStatusChange, onView, onPay }: Props) {
  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv?.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv?.patientId?._id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv?.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Invoices</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 w-48" />
            </div>
            <Tabs value={statusFilter} onValueChange={onStatusChange}>
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv?._id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">{inv?.uuid}</TableCell>
                    <TableCell className="font-medium">{inv?.patientId?.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(inv?.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{resolveItems(inv)}</TableCell>
                    <TableCell className="font-semibold">{resolveTotal(inv)}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[inv?.status]}>{inv?.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onView(inv)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onPay(inv)}>Pay</Button>
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
  );
}
