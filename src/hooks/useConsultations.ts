import { useFetchpatientsQuery } from "@/features/patientSlice";
import { useCreatevisitMutation } from "@/features/visitsSlice";
import { useState } from "react";
import { useDebounce } from "./use-debounce";

export function useConsultations() {
  const [page, setPage] = useState(1);
  const [track, setTrack] = useState("triage");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const query = useFetchpatientsQuery({
    page,
    limit: 5,
    search: debouncedSearch,
    track,
  });

  const [createVisit] = useCreatevisitMutation();

  return {
    ...query,
    page,
    setPage,
    track,
    setTrack,
    search,
    setSearch,
    createVisit,
  };
}
