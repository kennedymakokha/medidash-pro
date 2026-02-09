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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{consultation.name}</h3>
            <Badge>{consultation.track}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Chief Complaint</p>
            <p className="text-sm">{consultation.chiefComplaint || "N/A"}</p>
          </div>
          {consultation.symptoms?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {consultation.symptoms.map((s, i) => (
                  <Badge key={i} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {consultation.diagnosis && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
              <p className="text-sm">{consultation.diagnosis}</p>
            </div>
          )}
          {consultation.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{consultation.notes}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Fee: ${consultation.consultationFee}</p>
            <p>Created: {new Date(consultation.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
