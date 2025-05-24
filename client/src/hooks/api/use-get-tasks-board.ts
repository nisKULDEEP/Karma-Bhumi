import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api/index";

interface UseGetTasksBoardQueryParams {
  workspaceId: string;
  projectId: string;
}

const useGetTasksBoardQuery = ({ workspaceId, projectId }: UseGetTasksBoardQueryParams) => {
  return useQuery({
    queryKey: ["tasksBoard", workspaceId, projectId],
    queryFn: async () => {
      const { data } = await API.get(
        `/task/workspace/${workspaceId}/project/${projectId}/board`
      );
      return data;
    },
    enabled: !!workspaceId && !!projectId,
  });
};

export default useGetTasksBoardQuery;