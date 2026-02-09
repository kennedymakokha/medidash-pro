export function ConsultationStats({ consultations }: Props) {
  const stats = {
    triage: consultations.filter(c => c.track === "triage").length,
    awaiting: consultations.filter(c => c.track === "awaiting-lab").length,
    post: consultations.filter(c => c.track === "post-lab").length,
    completed: consultations.filter(c => c.track === "completed").length,
  };

  return (/* cards */);
}
