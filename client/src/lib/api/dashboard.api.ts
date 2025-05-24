import API from "../axios-client";

// Get dashboard statistics for the current user in a workspace
export const getDashboardStatsQueryFn = async ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  const response = await API.get(`/dashboard/workspace/${workspaceId}/stats`);
  return response.data;
};

// Get recent projects for the current user in a workspace
export const getRecentProjectsQueryFn = async ({
  workspaceId,
  limit = 3,
}: {
  workspaceId: string;
  limit?: number;
}) => {
  const response = await API.get(
    `/dashboard/workspace/${workspaceId}/projects/recent?limit=${limit}`
  );
  return response.data;
};

// Get upcoming tasks for the current user in a workspace
export const getUpcomingTasksQueryFn = async ({
  workspaceId,
  limit = 3,
}: {
  workspaceId: string;
  limit?: number;
}) => {
  const response = await API.get(
    `/dashboard/workspace/${workspaceId}/tasks/upcoming?limit=${limit}`
  );
  return response.data;
};

// Get active challenges for the current user
export const getActiveChallengesQueryFn = async () => {
  const response = await API.get(`/dashboard/challenges`);
  return response.data;
};