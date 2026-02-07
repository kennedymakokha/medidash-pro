import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone,
  Mail,
  MapPin,
  Droplets,
  Calendar,
  Stethoscope,
  DoorOpen,
  User,
  Replace,
  Users2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Patient } from "@/types/hospital";
import VisitsAccordion from "../patients/visitAccodion";
import Info from "../patients/infoCard";

const statusStyles = {
  admitted: "bg-info/10 text-info border-info/20",
  outpatient: "bg-success/10 text-success border-success/20",
  discharged: "bg-muted text-muted-foreground border-muted",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ViewPatientModal({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}) {
  const [showVisits, setShowVisits] = useState(false);

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ================= PATIENT HEADER (always visible) ================= */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {patient?.name.charAt(0)}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                {patient?.age} years, {patient.sex || "N/A"}
              </p>
              <Badge
                variant="outline"
                className={cn("mt-1 capitalize", statusStyles[patient?.status])}
              >
                {patient?.status}
              </Badge>
            </div>
          </div>

          {/* ================= LEVEL 1: VISIT HISTORY ================= */}
          <Accordion
            type="single"
            collapsible
            onValueChange={(v) => setShowVisits(!!v)}
          >
            <AccordionItem value="visits" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-semibold text-sm">Visit History</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.visits?.length || 0} total visits
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {patient.visits?.length || 0}
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-4 px-2">
                <VisitsAccordion visits={patient.visits || []} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ================= PATIENT DETAILS (hidden when visits open) ================= */}
          {!showVisits && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info icon={<Phone />} label="Phone" value={patient.phone} />
                <Info icon={<Mail />} label="Email" value={patient.email} />
                <Info
                  icon={<MapPin />}
                  label="Address"
                  value={patient.address}
                />
                <Info
                  icon={<Droplets className="text-destructive" />}
                  label="Blood Group"
                  value={patient.bloodgroup}
                  strong
                />
                {patient.assignedDoctor && (
                  <Info
                    icon={<Stethoscope />}
                    label="Doctor"
                    value={patient.assignedDoctor}
                  />
                )}
                {patient.room && (
                  <Info icon={<DoorOpen />} label="Room" value={patient.room} />
                )}
                {patient.admissionDate && (
                  <Info
                    icon={<Calendar />}
                    label="Admission Date"
                    value={patient.admissionDate}
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info
                  icon={<User />}
                  label="Nextofkin Name"
                  value={patient.nokName}
                />
                <Info icon={<Phone />} label="Phone" value={patient.nokPhone} />

                <Info
                  icon={<Users2Icon/>}
                  label="Relation"
                  value={patient.nokRelationship}
                  strong
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
