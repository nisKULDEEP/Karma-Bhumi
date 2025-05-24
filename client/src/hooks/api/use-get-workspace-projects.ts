import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";

interface Project {
  _id: string;
  name: string;
  color: string;
}

interface ProjectsResponse {
  projects: Project[];
  message: string;
}

const getWorkspaceProjectsQueryFn = async (workspaceId: string): Promise<ProjectsResponse> => {
  const response = await API.get(`/workspace/${workspaceId}/projects`);
  return response.data;
};

const useGetWorkspaceProjectsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspaceProjects", workspaceId],
    queryFn: () => getWorkspaceProjectsQueryFn(workspaceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!workspaceId,
  });
};

export default useGetWorkspaceProjectsQuery;