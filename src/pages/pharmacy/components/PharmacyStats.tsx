import { StatsCard } from "@/components/dashboard/StatsCard";
import { Medication } from "@/types/pharmacy";

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
      <StatsCard
        title="Total Medications"
        value={totalMeds}
        icon="pill"
        trend="neutral"
      />
      <StatsCard
        title="In Stock"
        value={inStock}
        icon="check"
        trend="up"
      />
      <StatsCard
        title="Low Stock"
        value={lowStock}
        icon="alert-triangle"
        trend="down"
      />
      <StatsCard
        title="Out of Stock"
        value={outOfStock}
        icon="x-circle"
        trend="down"
      />
      <StatsCard
        title="Pending Rx"
        value={pendingPrescriptions}
        icon="clipboard"
        trend="neutral"
      />
    </div>
  );
}
