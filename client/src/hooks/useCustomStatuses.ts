import { useCallback, useEffect, useState } from 'react';
import { CustomStatus } from '../types/task.type';

// Mock API functions - replace with actual API calls
const fetchCustomStatuses = async (workspaceId: string, projectId: string): Promise<CustomStatus[]> => {
  try {
    const response = await fetch(`/api/customStatus/workspace/${workspaceId}/project/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch custom statuses');
    }
    const data = await response.json();
    return data.customStatuses;
  } catch (error) {
    console.error('Error fetching custom statuses:', error);
    return [];
  }
};

const createCustomStatus = async (
  workspaceId: string, 
  projectId: string, 
  name: string, 
  color: string
): Promise<CustomStatus | null> => {
  try {
    const response = await fetch(`/api/customStatus/workspace/${workspaceId}/project/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, color }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create custom status');
    }
    
    const data = await response.json();
    return data.customStatus;
  } catch (error) {
    console.error('Error creating custom status:', error);
    return null;
  }
};

const updateCustomStatus = async (
  workspaceId: string, 
  projectId: string, 
  statusId: string, 
  updates: { name?: string; color?: string }
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/customStatus/${statusId}/workspace/${workspaceId}/project/${projectId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update custom status');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating custom status:', error);
    return false;
  }
};

const deleteCustomStatus = async (
  workspaceId: string, 
  projectId: string, 
  statusId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/customStatus/${statusId}/workspace/${workspaceId}/project/${projectId}`,
      {
        method: 'DELETE',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete custom status');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting custom status:', error);
    return false;
  }
};

export const useCustomStatuses = (workspaceId: string, projectId: string) => {
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load custom statuses from the server
  const loadCustomStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statuses = await fetchCustomStatuses(workspaceId, projectId);
      setCustomStatuses(statuses);
    } catch (err) {
      setError('Failed to load custom statuses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  // Create a new custom status
  const addCustomStatus = useCallback(async (name: string, color: string) => {
    const newStatus = await createCustomStatus(workspaceId, projectId, name, color);
    
    if (newStatus) {
      setCustomStatuses(prev => [...prev, newStatus]);
      return true;
    }
    
    return false;
  }, [workspaceId, projectId]);

  // Update an existing custom status
  const editCustomStatus = useCallback(async (
    statusId: string, 
    updates: { name?: string; color?: string }
  ) => {
    const success = await updateCustomStatus(workspaceId, projectId, statusId, updates);
    
    if (success) {
      setCustomStatuses(prev => 
        prev.map(status => 
          status.id === statusId ? { ...status, ...updates } : status
        )
      );
    }
    
    return success;
  }, [workspaceId, projectId]);

  // Delete a custom status
  const removeCustomStatus = useCallback(async (statusId: string) => {
    const success = await deleteCustomStatus(workspaceId, projectId, statusId);
    
    if (success) {
      setCustomStatuses(prev => prev.filter(status => status.id !== statusId));
    }
    
    return success;
  }, [workspaceId, projectId]);

  // Initial load of custom statuses
  useEffect(() => {
    loadCustomStatuses();
  }, [loadCustomStatuses]);

  return {
    customStatuses,
    loading,
    error,
    addCustomStatus,
    editCustomStatus,
    removeCustomStatus,
    refreshCustomStatuses: loadCustomStatuses,
  };
};