/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import useWorkspaceId from "@/hooks/use-workspace-id";
import { UserType } from "@/types/api.type";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import usePermissions from "@/hooks/use-permissions";
import { PermissionType } from "@/constant";
import API from "@/lib/axios-client"; 
import useAuthQuery from "@/hooks/api/use-auth"; // Renamed import
import { isAuthRoute } from "@/routes/common/routePaths";

// Define the context shape
interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  currentWorkspace?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  workspace: any | null; // Add workspace property
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearErrors: () => void;
  hasPermission: (permission: PermissionType) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export both hook versions
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = useWorkspaceId();
  
  // Use the improved useAuth hook instead of direct API calls
  const { 
    data: authData, 
    isLoading: authLoading,
    isError: authError 
  } = useAuthQuery(); // Using the renamed import
  
  // Only fetch workspace data if we have a workspace ID
  const skip = !workspaceId || !user;
  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useGetWorkspaceQuery(workspaceId, { enabled: !skip });

  const workspace = workspaceData?.workspace;

  // Update user state when auth data changes
  useEffect(() => {
    if (authData?.user) {
      setUser(authData.user);
    } else if (authError) {
      setUser(null);
    }
  }, [authData, authError]);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(authLoading || workspaceLoading);
  }, [authLoading, workspaceLoading]);

  // Handle workspace unauthorized errors
  useEffect(() => {
    if (workspaceError) {
      if (workspaceError?.errorCode === "ACCESS_UNAUTHORIZED" && !isAuthRoute(location.pathname)) {
        navigate("/");
      }
    }
  }, [navigate, workspaceError, location.pathname]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await API.post('/auth/login', { email, password }); 
      setUser(response.data.user);

      if (response.data.user.currentWorkspace) {
        navigate(`/workspace/${response.data.user.currentWorkspace}`);
      } else {
        navigate('/workspaces');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Login failed');
      } else {
        setError('An error occurred during login');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await API.post('/auth/register', { name, email, password }); 
      
      // Instead of auto-login, redirect to onboarding
      navigate("/onboarding");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        setError('An error occurred during registration');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await API.post('/auth/logout'); 
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  const permissions = usePermissions(user, workspace);

  const hasPermission = (permission: PermissionType): boolean => {
    return permissions.includes(permission);
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    workspace, // Add workspace to the context value
    login,
    register,
    logout,
    clearErrors,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
