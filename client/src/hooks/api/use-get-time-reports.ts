import { useQuery } from "@tanstack/react-query";
import { getTimeReportsQueryFn } from "@/lib/api";
import { TimeEntryFiltersType } from "@/types/time-tracking.type";

const useGetTimeReportsQuery = (workspaceId: string, filters?: TimeEntryFiltersType) => {
  const query = useQuery({
    queryKey: ["timeReports", workspaceId, filters],
    queryFn: () => getTimeReportsQueryFn(workspaceId, filters),
    staleTime: 60000, // 1 minute
    enabled: !!workspaceId,
  });

  return query;
};

export default useGetTimeReportsQuery;