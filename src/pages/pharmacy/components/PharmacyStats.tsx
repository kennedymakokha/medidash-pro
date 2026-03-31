import { StatsCard } from "@/components/dashboard/StatsCard";
import { Medication } from "@/types/pharmacy";
import { Pill, CheckCircle, AlertTriangle, XCircle, ClipboardList } from "lucide-react";

interface Props {
  medications: Medication[];
  pendingPrescriptions: number;
}

export function PharmacyStats({ medications, pendingPrescriptions }: Props) {
  const totalMeds = medications.length;
  const inStock = medications.filter((m) => m.status === "in-stock").length;
  const lowStock = medications.filter((m) => m.status === "low-stock").length;
  const outOfStock = medications.filter((m) => m.status === "out-of-stock").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatsCard title="Total Medications" value={totalMeds} icon={Pill} trend="neutral" />
      <StatsCard title="In Stock" value={inStock} icon={CheckCircle} trend="up" />
      <StatsCard title="Low Stock" value={lowStock} icon={AlertTriangle} trend="down" />
      <StatsCard title="Out of Stock" value={outOfStock} icon={XCircle} trend="down" />
      <StatsCard title="Pending Rx" value={pendingPrescriptions} icon={ClipboardList} trend="neutral" />
    </div>
  );
}
