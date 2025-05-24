import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";
import { Task } from "@/types/task.types";

interface TasksResponse {
  tasks: Task[];
  message: string;
}

const getProjectTasksQueryFn = async (projectId: string): Promise<TasksResponse> => {
  const response = await API.get(`/project/${projectId}/tasks`);
  return response.data;
};

const useGetProjectTasksQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["projectTasks", projectId],
    queryFn: () => getProjectTasksQueryFn(projectId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!projectId,
  });
};

export default useGetProjectTasksQuery;