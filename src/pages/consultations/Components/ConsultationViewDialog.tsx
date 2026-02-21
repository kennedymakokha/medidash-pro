import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Consultation } from "@/types/billing";

interface Props {
  open: boolean;
  onClose: () => void;
  consultation: Consultation | null;
}

export function ConsultationViewDialog({ open, onClose, consultation }: Props) {
  if (!consultation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consultation Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              {consultation.patientMongoose?.name || "Unknown Patient"}
            </h3>
            <Badge>{consultation.track}</Badge>
          </div>

          {/* Chief Complaint */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Chief Complaint
            </p>
            <p className="text-sm">
              {consultation.chiefComplaint || "N/A"}
            </p>
          </div>

          {/* Symptoms */}
          {consultation.symptoms?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Symptoms
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {consultation.symptoms.map((s, i) => (
                  <Badge key={i} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* ================= TRACK BASED CONTENT ================= */}

          {/* PRE-LAB → VITALS */}
          {consultation.track === "pre-lab" && consultation && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Vitals
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm bg-muted/40 p-3 rounded-md">
                <span>BP: {consultation?.bp ?? "--"}</span>
                <span>Temp: {consultation?.temperature ?? "--"}°C</span>
                <span>Pulse: {consultation?.pulse ?? "--"} bpm</span>
                <span>SpO₂: {consultation?.oxygenSaturation ?? "--"}%</span>
              </div>
            </div>
          )}

          {/* POST-LAB → LAB RESULTS */}
          {consultation.track === "post-lab" &&
            consultation.labResults?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lab Results
                </p>
                <div className="space-y-2 mt-2 bg-muted/40 p-3 rounded-md">
                  {consultation.labResults.map((lab, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm border-b pb-1 last:border-none"
                    >
                      <span>{lab.testName}</span>
                      <span className="font-medium">{lab.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* COMPLETED → MEDICINES */}
          {consultation.track === "completed" &&
            consultation.medicines?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Medicines
                </p>
                <div className="space-y-2 mt-2 bg-muted/40 p-3 rounded-md">
                  {consultation.medicines.map((med, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm border-b pb-1 last:border-none"
                    >
                      <span>{med.name}</span>
                      <span className="text-muted-foreground">
                        {med.dosage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Diagnosis */}
          {consultation.diagnosis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Diagnosis
              </p>
              <p className="text-sm">{consultation.diagnosis}</p>
            </div>
          )}

          {/* Notes */}
          {consultation.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Notes
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {consultation.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Fee: ${consultation.consultationFee}</p>
            <p>
              Created:{" "}
              {new Date(consultation.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
