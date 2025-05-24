import API from "../axios-client";
import { AllTeamsResponseType, TeamResponseType, TeamMembersResponseType } from "@/types/api.type";

export const getAllTeamsQueryFn = async (workspaceId: string): Promise<AllTeamsResponseType> => {
  const response = await API.get(`/team/workspace/${workspaceId}`);
  return response.data;
};

// Get all teams in a workspace with object parameter style (for backward compatibility)
export const getTeamsInWorkspaceQueryFn = async ({
  workspaceId
}: {
  workspaceId: string;
}): Promise<{
  teams: Array<{
    _id: string;
    name: string;
    description?: string;
    memberCount: number;
    projectCount: number;
  }>;
}> => {
  const response = await API.get(`/team/workspace/${workspaceId}`);
  return response.data;
};

export const createTeamMutationFn = async ({
  workspaceId, 
  data
}: {
  workspaceId: string;
  data: {
    name: string;
    description: string;
  }
}): Promise<TeamResponseType> => {
  const response = await API.post(`/team/workspace/${workspaceId}/create`, data);
  return response.data;
};

export const getTeamMembersQueryFn = async (
  workspaceId: string,
  teamId?: string
): Promise<TeamMembersResponseType> => {
  const endpoint = teamId 
    ? `/team/${teamId}/workspace/${workspaceId}/members`
    : `/workspace/members/${workspaceId}`;
  
  const response = await API.get(endpoint);
  return response.data;
};

export const editTeamMutationFn = async ({
  workspaceId,
  teamId,
  data
}: {
  workspaceId: string;
  teamId: string;
  data: {
    name: string;
    description?: string;
  };
}): Promise<TeamResponseType> => {
  const response = await API.put(`/team/${teamId}/workspace/${workspaceId}/update`, data);
  return response.data;
};

export const deleteTeamMutationFn = async ({
  workspaceId,
  teamId
}: {
  workspaceId: string;
  teamId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(`/team/${teamId}/workspace/${workspaceId}/delete`);
  return response.data;
};

export const getTeamByIdQueryFn = async ({
  workspaceId,
  teamId
}: {
  workspaceId: string;
  teamId: string;
}): Promise<{
  team: {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}> => {
  const response = await API.get(`/team/${teamId}/workspace/${workspaceId}`);
  return response.data;
};

export const getTeamProjectsQueryFn = async ({
  workspaceId,
  teamId
}: {
  workspaceId: string;
  teamId: string;
}): Promise<{
  projects: Array<{
    _id: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}> => {
  const response = await API.get(`/team/${teamId}/workspace/${workspaceId}/projects`);
  return response.data;
};