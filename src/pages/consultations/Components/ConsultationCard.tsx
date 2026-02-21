import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Consultation } from "@/types/billing";
import { Eye, ArrowRight, Edit } from "lucide-react";

const stageStyles: Record<string, { bg: string; label: string }> = {
  "pre-lab": { bg: "bg-primary/10 text-primary", label: "Pre-Lab" },
  "awaiting-lab": { bg: "bg-warning/10 text-warning", label: "Awaiting Lab" },
  "post-lab": { bg: "bg-info/10 text-info", label: "Post-Lab" },
  completed: { bg: "bg-success/10 text-success", label: "Completed" },
};

interface Props {
  consultation: Consultation;
  onNext: (c: Consultation) => void;
  onView: (c: Consultation) => void;
  onEdit: (c: Consultation) => void;
}

export function ConsultationCard({
  consultation,
  onNext,
  onView,
  onEdit,
}: Props) {
  const style = stageStyles[consultation.track] ?? stageStyles["pre-lab"];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {consultation?.patientMongoose?.name || "Unknown Patient"}
              </h3>
              <Badge className={style.bg}>{style.label}</Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1">
              {consultation.chiefComplaint || "No complaint recorded"}
            </p>

            {/* ===== TRACK BASED CONTENT ===== */}

            {/* PRE-LAB → VITALS */}
           
              <div className="mt-3 text-xs space-y-1 bg-muted/40 p-2 rounded-md">
                <p className="font-medium">Vitals</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>BP: {consultation?.bp ?? "--"}</span>
                  <span>Temp: {consultation?.temperature ?? "--"}°C</span>
                  <span>Pulse: {consultation?.pulse ?? "--"} bpm</span>
                  <span>SpO₂: {consultation?.oxygenSaturation ?? "--"}%</span>
                </div>
              </div>
           

            {/* POST-LAB → LAB RESULTS */}
            {
              consultation?.labResults?.length > 0 && (
                <div className="mt-3 text-xs space-y-1 bg-muted/40 p-2 rounded-md">
                  <p className="font-medium">Lab Results</p>
                  <div className="flex flex-wrap gap-1">
                    {consultation?.labResults.slice(0, 3).map((lab, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {lab.testName}: {lab.result}
                      </Badge>
                    ))}
                    {consultation?.labResults.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{consultation?.labResults.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

            {/* COMPLETED → MEDICINES */}
            {
              consultation?.medicines?.length > 0 && (
                <div className="mt-3 text-xs space-y-1 bg-muted/40 p-2 rounded-md">
                  <p className="font-medium">Medicines</p>
                  <div className="flex flex-wrap gap-1">
                    {consultation?.medicines.slice(0, 3).map((med, i) => (
                      <Badge key={i} variant="default" className="text-xs">
                        {med.name}
                      </Badge>
                    ))}
                    {consultation?.medicines.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{consultation.medicines.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(consultation)}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(consultation)}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {consultation.track === "pre-lab" && (
              <Button
                size="sm"
                onClick={() => onNext(consultation)}
                className="gap-1"
              >
                Next <ArrowRight className="w-3 h-3" />
              </Button>
            )}

            {consultation.track === "post-lab" && (
              <Button
                size="sm"
                onClick={() => onNext(consultation)}
                className="gap-1"
              >
                Next <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
