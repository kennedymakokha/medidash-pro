import { useFetchpatientsQuery } from "@/features/patientSlice";
import { useCreatevisitMutation, useFetchvisitsQuery } from "@/features/visitsSlice";
import { useState } from "react";
import { useDebounce } from "./use-debounce";

export function useConsultations() {
  const [page, setPage] = useState(1);
  const [track, setTrack] = useState("pre-lab");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");

  const debouncedSearch = useDebounce(search, 400);

  const query = useFetchvisitsQuery({
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
    status,
    setTrack,
    search,
    setSearch,
    createVisit,
  };
}
