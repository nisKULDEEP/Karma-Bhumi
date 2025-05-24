import API from "../axios-client";
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CreateWorkspaceResponseType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType
} from "@/types/api.type";

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn = async (): Promise<AllWorkspaceResponseType> => {
  const response = await API.get(`/workspace/all`);
  return response.data;
};

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

// Moved to member.api.ts as getTeamMembersQueryFn
// export const getMembersInWorkspaceQueryFn = async (
//   workspaceId: string
// ): Promise<AllMembersInWorkspaceResponseType> => {
//   const response = await API.get(`/workspace/members/${workspaceId}`);
//   return response.data;
// };

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};