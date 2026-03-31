import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Medication, Prescription, PrescriptionItem } from "@/types/pharmacy";
import { PharmacyStats } from "./components/PharmacyStats";
import { MedicationTable } from "./components/MedicationTable";
import { MedicationFormDialog } from "./components/MedicationFormDialog";
import { RestockDialog } from "./components/RestockDialog";
import { PrescriptionTable } from "./components/PrescriptionTable";
import { DispenseDialog } from "./components/DispenseDialog";
import { PrescriptionViewDialog } from "./components/PrescriptionViewDialog";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import {
  useFetchMedicationsQuery,
  useCreateMedicationMutation,
  useUpdateMedicationMutation,
  useDeleteMedicationMutation,
  useRestockMedicationMutation,
  useFetchPrescriptionsQuery,
  useDispensePrescriptionMutation,
} from "@/features/pharmacySlice";
import { toast } from "@/hooks/use-toast";
import { TableSkeleton } from "@/components/loaders";

export default function PharmacyPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("inventory");

  // Medication state
  const [medFormOpen, setMedFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medication | null>(null);
  const [restockTarget, setRestockTarget] = useState<Medication | null>(null);

  // Prescription state
  const [viewRx, setViewRx] = useState<Prescription | null>(null);
  const [dispenseRx, setDispenseRx] = useState<Prescription | null>(null);

  // API hooks
  const { data: medsData, isLoading: medsLoading, refetch: refetchMeds } = useFetchMedicationsQuery({
    page: 1, limit: 10000, search, status: "",
  });
  const { data: rxData, isLoading: rxLoading, refetch: refetchRx } = useFetchPrescriptionsQuery({
    page: 1, limit: 10000, status: "",
  });

  const [createMed] = useCreateMedicationMutation();
  const [updateMed] = useUpdateMedicationMutation();
  const [deleteMed] = useDeleteMedicationMutation();
  const [restockMed] = useRestockMedicationMutation();
  const [dispense] = useDispensePrescriptionMutation();

  const medications: Medication[] = medsData?.data ?? [];
  const prescriptions: Prescription[] = rxData?.data ?? [];
  const pendingRx = prescriptions.filter((r) => r.status === "pending").length;

  const handleMedSubmit = async (data: Partial<Medication>) => {
    try {
      if (editingMed) {
        await updateMed({ id: editingMed._id || editingMed.id, ...data }).unwrap();
        toast({ title: "Medication updated" });
      } else {
        await createMed(data).unwrap();
        toast({ title: "Medication added" });
      }
      setMedFormOpen(false);
      setEditingMed(null);
      refetchMeds();
    } catch {
      toast({ title: "Error", description: "Failed to save medication.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMed(deleteTarget._id || deleteTarget.id).unwrap();
      toast({ title: "Medication deleted" });
      setDeleteTarget(null);
      refetchMeds();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleRestock = async (data: { medicationId: string; quantity: number; supplier: string; batchNumber: string; unitCost: number }) => {
    try {
      await restockMed(data).unwrap();
      toast({ title: "Medication restocked", description: `Added ${data.quantity} units.` });
      setRestockTarget(null);
      refetchMeds();
    } catch {
      toast({ title: "Error", description: "Failed to restock.", variant: "destructive" });
    }
  };

  const handleDispense = async (prescriptionId: string, items: PrescriptionItem[]) => {
    try {
      await dispense({ prescriptionId, items }).unwrap();
      toast({ title: "Medication dispensed" });
      setDispenseRx(null);
      refetchRx();
      refetchMeds();
    } catch {
      toast({ title: "Error", description: "Failed to dispense.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Pharmacy">
      <PharmacyStats medications={medications} pendingPrescriptions={pendingRx} />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            {tab === "inventory" && (
              <>
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medications..."
                    className="pl-9 w-full sm:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => { setEditingMed(null); setMedFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="inventory">
          {medsLoading ? (
            <TableSkeleton />
          ) : (
            <MedicationTable
              medications={medications}
              onEdit={(med) => { setEditingMed(med); setMedFormOpen(true); }}
              onDelete={setDeleteTarget}
              onRestock={setRestockTarget}
            />
          )}
        </TabsContent>

        <TabsContent value="prescriptions">
          {rxLoading ? (
            <TableSkeleton />
          ) : (
            <PrescriptionTable
              prescriptions={prescriptions}
              onView={setViewRx}
              onDispense={setDispenseRx}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <MedicationFormDialog
        open={medFormOpen}
        onClose={() => { setMedFormOpen(false); setEditingMed(null); }}
        onSubmit={handleMedSubmit}
        initialData={editingMed}
      />

      <RestockDialog
        open={!!restockTarget}
        onClose={() => setRestockTarget(null)}
        medication={restockTarget}
        onSubmit={handleRestock}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Medication"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />

      <PrescriptionViewDialog
        open={!!viewRx}
        onClose={() => setViewRx(null)}
        prescription={viewRx}
      />

      <DispenseDialog
        open={!!dispenseRx}
        onClose={() => setDispenseRx(null)}
        prescription={dispenseRx}
        onSubmit={handleDispense}
      />
    </DashboardLayout>
  );
}
