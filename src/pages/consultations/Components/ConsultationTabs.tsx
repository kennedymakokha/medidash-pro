// ConsultationTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Consultation } from "@/types/billing";
import { ConsultationCard } from "./ConsultationCard";

type Props = {
  consultations: Consultation[];
  track: string;
  onChange: (value: string) => void;
  onNext: (c: Consultation) => void;
  onView: (c: Consultation) => void;
  onEdit: (c: Consultation) => void;
};

const TABS = [
  
  { label: "Pre-Lab", value: "pre-lab" },
  { label: "Awaiting Lab", value: "awaiting-lab" },
  { label: "Post-Lab", value: "post-lab" },
  { label: "Completed", value: "completed" },
];

export function ConsultationTabs({
  consultations,
  track,
  onChange,
  onNext,
  onView,
  onEdit,
}: Props) {
  const filterByTab = (tab: string) =>
    consultations.filter(
      (c) => tab === "pre-lab" || c.track === tab,
    );

  return (
    <Tabs value={track} onValueChange={onChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-4">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const data = filterByTab(tab.value);

        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="space-y-4"
          >
            {data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No consultations found.
              </div>
            ) : (
              data.map((consultation) => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  onNext={onNext}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
