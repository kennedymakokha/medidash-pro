import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill, Search, User, Clock, CheckCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  useFetchPrescriptionsQuery,
  useDispensePrescriptionMutation,
} from "@/features/pharmacySlice";
import { Prescription, PrescriptionItem } from "@/types/pharmacy";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/loaders";
import { useConsultations } from "@/hooks/useConsultations";
import { useFetchvisitsQuery } from "@/features/visitsSlice";

export default function DispensePage() {
  const [search, setSearch] = useState("");
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispenseItems, setDispenseItems] = useState<PrescriptionItem[]>([]);
// const { data, isLoading, track:pharmacy, setTrack, refetch } = useConsultations();
// console.log(data?.data);
  const { data: rxData, isLoading, refetch } =  useFetchvisitsQuery({
      page:1,
      limit: 1000,
      search: "",
      track:"pharmacy",
    });
    console.log(rxData);
  const [dispense, { isLoading: dispensing }] = useDispensePrescriptionMutation();

  const prescriptions: Prescription[] = [].filter((rx: Prescription) =>
    rx.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    rx.doctorName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectPrescription = (rx: Prescription) => {
    setSelectedRx(rx);
    setDispenseItems(
      rx.medications.map((m) => ({ ...m, dispensedQuantity: m.quantity }))
    );
  };

  const updateQty = (index: number, qty: number) => {
    setDispenseItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, dispensedQuantity: Math.min(Math.max(0, qty), item.quantity) } : item
      )
    );
  };

  const totalAmount = dispenseItems.reduce(
    (sum, item) => sum + (item.dispensedQuantity || 0) * item.unitPrice, 0
  );

  const handleDispense = async () => {
    if (!selectedRx) return;
    try {
      await dispense({
        prescriptionId: selectedRx._id || selectedRx.id,
        items: dispenseItems,
      }).unwrap();
      toast({ title: "Medication Dispensed", description: `Total: KES ${totalAmount.toFixed(2)}` });
      setSelectedRx(null);
      setDispenseItems([]);
      refetch();
    } catch {
      toast({ title: "Error", description: "Failed to dispense medication.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Dispense Medication" subtitle="Process pending prescriptions and dispense medications">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-card-foreground">{prescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-card-foreground">
                {prescriptions.reduce((s, r) => s + r.medications.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selected</p>
              <p className="text-2xl font-bold text-card-foreground">{selectedRx ? 1 : 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Prescription List */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pending Prescriptions</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or doctor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No pending prescriptions</p>
                </div>
              ) : (
                prescriptions.map((rx) => {
                  const rid = rx._id || rx.id || rx.uuid;
                  const isSelected = (selectedRx?._id || selectedRx?.id) === rid;
                  return (
                    <button
                      key={rid}
                      onClick={() => selectPrescription(rx)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{rx.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            Dr. {rx.doctorName} • {rx.medications.length} item{rx.medications.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                          Pending
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dispense Details */}
        <Card className="lg:col-span-3 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dispense Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRx ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selectedRx.patientName}</p>
                    <p className="text-xs text-muted-foreground">Prescribed by Dr. {selectedRx.doctorName}</p>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead className="text-center">Prescribed</TableHead>
                        <TableHead className="text-center">Dispense</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dispenseItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <p className="text-sm font-medium">{item.medicationName}</p>
                            <p className="text-xs text-muted-foreground">{item.frequency} • {item.duration}</p>
                          </TableCell>
                          <TableCell className="text-sm">{item.dosage}</TableCell>
                          <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={0}
                              max={item.quantity}
                              value={item.dispensedQuantity || 0}
                              onChange={(e) => updateQty(idx, Number(e.target.value))}
                              className="w-16 h-8 text-center mx-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            KES {((item.dispensedQuantity || 0) * item.unitPrice).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-lg font-bold">Total: KES {totalAmount.toFixed(2)}</p>
                  <Button onClick={handleDispense} disabled={dispensing} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {dispensing ? "Dispensing..." : "Confirm Dispense"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Pill className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Select a prescription to dispense</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
