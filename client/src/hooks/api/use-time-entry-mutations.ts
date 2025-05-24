import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createTimeEntryMutationFn, 
  updateTimeEntryMutationFn, 
  deleteTimeEntryMutationFn 
} from "@/lib/api";
import { CreateTimeEntryType, TimeEntryType } from "@/types/time-tracking.type";

export const useTimeEntryMutations = (workspaceId: string) => {
  const queryClient = useQueryClient();

  const createTimeEntry = useMutation({
    mutationFn: (data: CreateTimeEntryType) => createTimeEntryMutationFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["timeReports", workspaceId] });
    },
  });

  const updateTimeEntry = useMutation({
    mutationFn: ({ timeEntryId, data }: { timeEntryId: string; data: Partial<TimeEntryType> }) => 
      updateTimeEntryMutationFn(timeEntryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["timeReports", workspaceId] });
    },
  });

  const deleteTimeEntry = useMutation({
    mutationFn: (timeEntryId: string) => deleteTimeEntryMutationFn(timeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeEntries", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["timeReports", workspaceId] });
    },
  });

  return {
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  };
};

export default useTimeEntryMutations;