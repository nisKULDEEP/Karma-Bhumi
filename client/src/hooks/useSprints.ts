import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { ISprint } from '../types/task.type';

export const useSprints = (workspaceId: string, projectId: string) => {
  const [sprints, setSprints] = useState<ISprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<ISprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all sprints for a project
  const fetchSprints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/all`
      );
      
      setSprints(response.data.sprints);
      
      // Check if there's an active sprint
      const activeSprintResponse = await axios.get(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/active`
      );
      
      setActiveSprint(activeSprintResponse.data.activeSprint);
    } catch (err) {
      setError('Failed to load sprints');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, projectId]);

  // Create a new sprint
  const createSprint = async (sprintData: {
    name: string;
    startDate: Date;
    endDate: Date;
    goal?: string;
  }) => {
    try {
      const response = await axios.post(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/create`,
        sprintData
      );
      
      // Refetch sprints to update the list
      await fetchSprints();
      
      return response.data.sprint;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to create sprint');
      }
      throw new Error('Failed to create sprint');
    }
  };

  // Start a sprint
  const startSprint = async (sprintId: string) => {
    try {
      await axios.patch(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/${sprintId}/start`
      );
      
      // Refetch sprints and invalidate board data
      await fetchSprints();
      queryClient.invalidateQueries(['board', workspaceId, projectId]);
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to start sprint');
      }
      throw new Error('Failed to start sprint');
    }
  };

  // Complete a sprint
  const completeSprint = async (sprintId: string) => {
    try {
      await axios.patch(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/${sprintId}/complete`
      );
      
      // Refetch sprints and invalidate board data
      await fetchSprints();
      queryClient.invalidateQueries(['board', workspaceId, projectId]);
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to complete sprint');
      }
      throw new Error('Failed to complete sprint');
    }
  };

  // Delete a sprint
  const deleteSprint = async (sprintId: string) => {
    try {
      await axios.delete(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/${sprintId}/delete`
      );
      
      // Refetch sprints
      await fetchSprints();
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to delete sprint');
      }
      throw new Error('Failed to delete sprint');
    }
  };

  // Add tasks to a sprint
  const addTasksToSprint = async (sprintId: string, taskIds: string[]) => {
    try {
      await axios.post(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/${sprintId}/tasks/add`,
        { taskIds }
      );
      
      // Invalidate board data
      queryClient.invalidateQueries(['board', workspaceId, projectId]);
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to add tasks to sprint');
      }
      throw new Error('Failed to add tasks to sprint');
    }
  };

  // Remove a task from sprint
  const removeTaskFromSprint = async (sprintId: string, taskId: string) => {
    try {
      await axios.delete(
        `/api/sprint/workspace/${workspaceId}/project/${projectId}/${sprintId}/tasks/${taskId}/remove`
      );
      
      // Invalidate board data
      queryClient.invalidateQueries(['board', workspaceId, projectId]);
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(err.response.data.message || 'Failed to remove task from sprint');
      }
      throw new Error('Failed to remove task from sprint');
    }
  };
  
  // Initial fetch of sprints
  useEffect(() => {
    if (workspaceId && projectId) {
      fetchSprints();
    }
  }, [workspaceId, projectId, fetchSprints]);

  return {
    sprints,
    activeSprint,
    isLoading,
    error,
    fetchSprints,
    createSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    addTasksToSprint,
    removeTaskFromSprint
  };
};