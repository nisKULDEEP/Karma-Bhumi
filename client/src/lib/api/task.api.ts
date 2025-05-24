import API from "../axios-client";
import {
  AllTaskPayloadType,
  AllTaskResponseType,
  CreateTaskPayloadType
} from "@/types/api.type";
import { ITask } from "@/types/task.types";

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const getTaskByIdQueryFn = async ({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId?: string;
  taskId: string;
}) => {
  const response = await API.get(
    `/task/${taskId}/project/${projectId || 'unknown'}/workspace/${workspaceId}`
  );
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

// Task status update mutation
export const updateTaskStatusMutationFn = async ({
  workspaceId,
  projectId,
  taskId,
  status,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  status: string;
}) => {
  const response = await API.patch(
    `/task/${taskId}/workspace/${workspaceId}/project/${projectId}/status`,
    { status }
  );
  return response.data;
};

/**
 * Get tasks using the fetch API interface
 * @deprecated Use getAllTasksQueryFn instead
 */
export const getTasksQuery = async (workspaceId: string, projectId?: string) => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.append("projectId", projectId);
  
  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

/**
 * Update task with partial data
 */
export const updateTaskMutationFn = async ({
  workspaceId,
  projectId,
  taskId,
  data,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  data: Partial<ITask>;
}): Promise<ITask> => {
  const response = await API.patch(
    `/task/${taskId}/workspace/${workspaceId}/project/${projectId}/update`,
    data
  );
  return response.data;
};