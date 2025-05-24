import { useQuery } from "@tanstack/react-query";
import { getTimeEntriesQueryFn } from "@/lib/api";
import { TimeEntryFiltersType } from "@/types/time-tracking.type";

const useGetTimeEntriesQuery = (workspaceId: string, filters?: TimeEntryFiltersType) => {
  const query = useQuery({
    queryKey: ["timeEntries", workspaceId, filters],
    queryFn: () => getTimeEntriesQueryFn(workspaceId, filters),
    staleTime: 60000, // 1 minute
    enabled: !!workspaceId,
  });

  return query;
};

export default useGetTimeEntriesQuery;