import API from "../axios-client";

// List view tasks for a board or project
export const getListViewTasksQueryFn = async ({
  workspaceId,
  projectId,
  boardId,
  pageSize = 100,
  pageNumber = 1,
}: {
  workspaceId: string;
  projectId?: string;
  boardId?: string;
  pageSize?: number;
  pageNumber?: number;
}) => {
  let url = `/task/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`;
  if (projectId) url += `&projectId=${projectId}`;
  if (boardId) url += `&boardId=${boardId}`;
  const response = await API.get(url);
  return response.data;
};

// Fetch all boards for a project
export const getBoardsQueryFn = async ({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) => {
  const response = await API.get(
    `/board/workspace/${workspaceId}/project/${projectId}/all`
  );
  return response.data;
};

// Create a new board
export const createBoardMutationFn = async ({
  workspaceId,
  projectId,
  name,
  description,
  type,
}: {
  workspaceId: string;
  projectId: string;
  name: string;
  description?: string;
  type: string;
}) => {
  const response = await API.post(`/board/workspace/${workspaceId}/project/${projectId}/create`, {
    name,
    description,
    type,
  });
  return response.data;
};

// Get details of a specific board
export const getBoardDetailsQueryFn = async ({
  workspaceId,
  projectId,
  boardId,
}: {
  workspaceId: string;
  projectId: string;
  boardId: string;
}) => {
  const response = await API.get(
    `/board/workspace/${workspaceId}/project/${projectId}/board/${boardId}`
  );
  return response.data;
};

// Update a board
export const updateBoardMutationFn = async ({
  workspaceId,
  projectId,
  boardId,
  data,
}: {
  workspaceId: string;
  projectId: string;
  boardId: string;
  data: {
    name?: string;
    description?: string;
    isDefault?: boolean;
  };
}) => {
  const response = await API.patch(
    `/board/workspace/${workspaceId}/project/${projectId}/board/${boardId}`,
    data
  );
  return response.data;
};

// Delete a board
export const deleteBoardMutationFn = async ({
  workspaceId,
  projectId,
  boardId,
}: {
  workspaceId: string;
  projectId: string;
  boardId: string;
}) => {
  const response = await API.delete(
    `/board/workspace/${workspaceId}/project/${projectId}/board/${boardId}`
  );
  return response.data;
};

// Update task status (for drag and drop on board)
export const updateTaskStatusOnBoardMutationFn = async ({
  workspaceId,
  taskId,
  status,
}: {
  workspaceId: string;
  taskId: string;
  status: string;
}) => {
  const response = await API.patch(
    `/task/workspace/${workspaceId}/task/${taskId}/status`,
    { status }
  );
  return response.data;
};
