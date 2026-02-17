import { TrendingUp, DollarSign, AlertCircle, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "@/types/finance";

interface Props {
  invoices: Invoice[];
}

export function FinanceStats({ invoices }: Props) {
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Total Revenue", value: `Ksh ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: "Pending", value: `Ksh ${totalPending.toLocaleString()}`, icon: DollarSign, color: "bg-warning/10 text-warning" },
    { label: "Overdue", value: `Ksh ${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
    { label: "Invoices", value: invoices.length, icon: Receipt, color: "bg-primary/10 text-primary" },
  ];

  return (
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
  );
}
