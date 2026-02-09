import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConsultationCard({
  consultation,
  onNext,
  onView,
  onEdit,
}: Props) {
  const style = stageStyles[consultation.track];

  return (
    <Card>
      {/* patient header */}
      {/* vitals */}
      {/* complaint */}
      <Button onClick={() => onNext(consultation)}>Next</Button>
    </Card>
  );
}
