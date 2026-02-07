import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { Visit } from "@/types/hospital";


function VisitsAccordion({ visits }: { visits: Visit[] }) {
  if (!visits?.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No visits recorded for this patient
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {visits.map((visit) => {
        const date =
          visit.visitDate || visit.createdAt
            ? new Date(visit.visitDate || visit.createdAt).toLocaleDateString()
            : "Unknown date";

        return (
          <AccordionItem
            key={visit._id}
            value={visit._id}
            className="border rounded-lg px-4"
          >
            {/* HEADER */}
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    Visit on {date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seen by {visit.created_by?.name || "Unknown clinician"}
                  </p>
                </div>

                {/* Vitals preview */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {visit.bp && <Badge variant="outline">BP: {visit.bp}</Badge>}
                  {visit.pulse && <Badge variant="outline">Pulse: {visit.pulse}</Badge>}
                  {visit.temperature && (
                    <Badge variant="outline">Temp: {visit.temperature}°</Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            {/* CONTENT */}
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="Diagnosis" value={visit.diagnosis} />
                <Info label="Disposition" value={visit.disposition} />
                <Info label="Respiratory Rate" value={visit.respiratoryRate} />
                <Info label="Notes" value={visit.notes} />

                {/* Future ready */}
                <Info label="Lab Orders" value={visit.labOrders} />
              </div>

              {/* Future sections */}
              {/* 
              <Separator className="my-4" />
              <LabResults labs={visit.labs} />
              <Procedures procedures={visit.procedures} />
              */}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="bg-muted/40 p-3 rounded-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}


export default VisitsAccordion