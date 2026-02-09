import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Clock, FlaskConical, CheckCircle2 } from "lucide-react";
import { Consultation } from "@/types/billing";

interface Props {
  consultations: Consultation[];
}

export function ConsultationStats({ consultations }: Props) {
  const stats = [
    {
      label: "Triage",
      value: consultations.filter((c) => c.track === "pre-lab").length,
      icon: Stethoscope,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Awaiting Lab",
      value: consultations.filter((c) => c.track === "awaiting-lab").length,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Post-Lab",
      value: consultations.filter((c) => c.track === "post-lab").length,
      icon: FlaskConical,
      color: "bg-info/10 text-info",
    },
    {
      label: "Completed",
      value: consultations.filter((c) => c.track === "completed").length,
      icon: CheckCircle2,
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
