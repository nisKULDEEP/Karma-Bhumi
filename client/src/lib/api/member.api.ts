import API from "../axios-client";

export const invitedUserJoinWorkspaceMutationFn = async (
  inviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  const response = await API.post(`/member/workspace/${inviteCode}/join`);
  return response.data;
};

// Member and workspace-related functions
export const getWorkspaceMembersQueryFn = async ({
  workspaceId
}: {
  workspaceId: string;
}): Promise<{
  members: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture?: string;
    };
    role: string;
  }>;
}> => {
  const response = await API.get(`/member/workspace/${workspaceId}`);
  return response.data;
};

// Function to send email invitation to workspace member
export const inviteWorkspaceMemberMutationFn = async ({
  workspaceId,
  email
}: {
  workspaceId: string;
  email: string;
}): Promise<{
  message: string;
  success: boolean;
}> => {
  const response = await API.post(`/member/workspace/${workspaceId}/invite`, {
    email
  });
  return response.data;
};

// Get members for a specific team or all workspace members
export const getTeamMembersByWorkspaceQueryFn = async (
  workspaceId: string,
  teamId?: string
): Promise<{
  members: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture?: string;
    };
    role: string;
  }>;
  roles?: Array<{
    _id: string;
    name: string;
  }>;
}> => {
  const endpoint = teamId 
    ? `/member/team/${teamId}/workspace/${workspaceId}/members`
    : `/workspace/members/${workspaceId}`;
  
  const response = await API.get(endpoint);
  return response.data;
};

// Team member API functions
export const addTeamMemberMutationFn = async ({
  workspaceId,
  teamId,
  userId
}: {
  workspaceId: string;
  teamId: string;
  userId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.post(`/member/team/${teamId}/workspace/${workspaceId}/add`, {
    userId
  });
  return response.data;
};

export const removeTeamMemberMutationFn = async ({
  workspaceId,
  teamId,
  userId
}: {
  workspaceId: string;
  teamId: string;
  userId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(`/member/team/${teamId}/workspace/${workspaceId}/remove/${userId}`);
  return response.data;
};