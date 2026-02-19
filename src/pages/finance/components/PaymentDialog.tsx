import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice } from "@/types/finance";

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
}

function resolveAmount(inv: Invoice): string | number {
  const track = inv?.track;
  if (track === "lab_billing") return inv?.labFee ?? 0;
  if (track === "reg_billing") return inv?.consultationFee ?? 0;
  return inv?.medFee ?? 0;
}

function resolveLabel(inv: Invoice): string {
  const track = inv?.track;
  if (track === "lab_billing") return "Lab Tests";
  if (track === "reg_billing") return "Registration";
  return "Medication";
}

export function PaymentDialog({ invoice, onClose, onConfirm }: Props) {
  const [method, setMethod] = useState("cash");

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        {invoice && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">{invoice?.patientId?.name}</p>
              <p className="text-2xl font-bold mt-1">Ksh {resolveAmount(invoice)}</p>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
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
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onConfirm(method)}>
                Confirm {resolveLabel(invoice)} Payment
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
