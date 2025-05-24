import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface AddTaskParams {
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  project: string;
  workspace: string;
}

export const useTaskActions = (workspaceId: string, projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const addTask = async (taskData: AddTaskParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
        taskData
      );
      
      // Invalidate the board query to refetch the updated tasks
      queryClient.invalidateQueries({ queryKey: ['board', workspaceId, projectId] });
      
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to add task');
      } else {
        setError('An error occurred while adding the task');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTask,
    isLoading,
    error
  };
};