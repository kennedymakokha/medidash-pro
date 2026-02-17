import { CreditCard, DollarSign, Banknote, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Invoice } from "@/types/finance";
import { timeSince } from "@/utils/timeslice";

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

const VAT_RATE = 0.16;

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceViewDialog({ invoice, onClose }: Props) {
  const items = invoice?.visitId?.prescribedTests ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice?.uuid}</DialogTitle>
        </DialogHeader>
        {invoice && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{invoice.patientId?.name}</p>
                <p className="text-sm text-muted-foreground">{timeSince(invoice.createdAt)}</p>
              </div>
              <Badge className={statusStyles[invoice.status]}>{invoice.status}</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="text-sm">{item.description}</p>
                      <Badge variant="outline" className="text-xs mt-0.5">{item.testName}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t pt-3 space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Subtotal: Ksh {subtotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">VAT (16%): Ksh {vat.toFixed(2)}</p>
              <p className="text-lg font-bold">Total: Ksh {total.toFixed(2)}</p>
            </div>
            {invoice.paymentMethod && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {methodIcons[invoice.paymentMethod]}
                <span className="capitalize">Paid via {invoice.paymentMethod}</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
