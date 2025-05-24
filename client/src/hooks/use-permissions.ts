import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useEffect, useMemo, useState } from "react";
import API from "@/lib/axios-client";
import { useQuery } from "@tanstack/react-query";

/**
 * Enhanced hook to fetch and manage user permissions
 * This ensures permissions come from the backend as the source of truth
 */
const usePermissions = (
  user: UserType | null,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [cachedPermissions, setCachedPermissions] = useState<PermissionType[]>([]);
  const workspaceId = workspace?._id;

  // Use React Query to fetch permissions from the backend
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ['permissions', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { permissions: [] };
      
      try {
        const response = await API.get(`/user/workspace/${workspaceId}/permissions`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        return { permissions: [] };
      }
    },
    enabled: !!workspaceId && !!user,
    // Keep the permissions data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Fallback to cached permissions if we're in a loading state
  const permissions = useMemo(() => {
    // If we have permissions from the backend, use those
    if (permissionsData?.permissions) {
      return permissionsData.permissions;
    }
    
    // While loading or if the API call fails, fallback to workspace data
    // This maintains backwards compatibility while we transition
    if (isLoading && cachedPermissions.length > 0) {
      return cachedPermissions;
    }
    
    // Final fallback: extract permissions from workspace data
    if (user && workspace) {
      const member = workspace.members.find(
        (member) => member.userId === user._id
      );
      if (member && member.role.permissions) {
        return member.role.permissions;
      }
    }
    
    return [];
  }, [permissionsData, isLoading, cachedPermissions, user, workspace]);

  // Keep the cached permissions updated with the latest data
  useEffect(() => {
    if (permissions.length > 0) {
      setCachedPermissions(permissions);
    }
  }, [permissions]);

  return permissions;
};

export default usePermissions;
