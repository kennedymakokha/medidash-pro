// ConsultationTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Consultation } from "@/types/billing";
import { ConsultationCard } from "./ConsultationCard";
import { calculateEWS, getEWSStatus } from "@/pages/vitals/components/VitalsStats";
import { VitalRecord } from "@/types/hospital";


type Props = {
  consultations: Consultation[];
  track: string;
  onChange: (value: string) => void;
  onNext: (consultation: Consultation) => void;
  onView: (consultation: Consultation) => void;
  onEdit: (consultation: Consultation) => void;
};

const TABS = [
  { label: "Pre-Lab", value: "pre-lab" },
  { label: "Awaiting Lab", value: "awaiting-lab" },
  { label: "Post-Lab", value: "post-lab" },
  { label: "Completed", value: "completed" },
];

const STATUS_PRIORITY: Record<string, number> = {
  critical: 0,
  warning: 1,
  normal: 2,
};

export function ConsultationTabs({
  consultations,
  track,
  onChange,
  onNext,
  onView,
  onEdit,
}: Props) {
  // Compute EWS status for each consultation
  const filterByTab = (tabValue: string) =>
    consultations
      .filter((c) => (tabValue === "pre-lab" ? c.track === "pre-lab" : c.track === tabValue))
      .map((c:{vitals:any}) => {
        // If consultation has linked vitals, compute EWS
        const ewsScore = c.vitals ? calculateEWS(c.vitals) : 0;
        const ewsStatus = getEWSStatus(ewsScore);
        return { ...c, ewsStatus };
      })
      .sort((a, b) => STATUS_PRIORITY[a.ewsStatus] - STATUS_PRIORITY[b.ewsStatus]);

  return (
    <Tabs value={track} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const data = filterByTab(tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No consultations found.
              </div>
            ) : (
              data.map((consultation:any|null) => (
                <ConsultationCard
                  key={consultation._id ?? consultation.id}
                  consultation={consultation}
                  onNext={onNext}
                  onView={onView}
                  onEdit={onEdit}
                  status={consultation.ewsStatus} // pass EWS status for badge/color
                />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}