import { useAuth } from '../context/auth-provider';

// Define the permission types
export type Permission = 
  | 'create:task'
  | 'update:task'
  | 'delete:task'
  | 'manage:workspace'
  | 'invite:members'
  | 'manage:project';

/**
 * Custom hook to check if the current user has the required permissions
 */
export const usePermission = () => {
  const { user, isAuthenticated } = useAuth();
  
  const hasPermission = (requiredPermission: Permission): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    // In a real app, you would check against the user's role/permissions here
    // For now, we'll assume that any authenticated user has all permissions
    return true;
  };
  
  return { hasPermission };
};