import { useCallback, useEffect, useState } from 'react';
import { DraggableLocation } from '@hello-pangea/dnd';
import { IBoard, IColumn, ITask, TaskStatus } from '../types/task.type';

// Mock API functions - replace with actual API calls
const fetchTasksForBoard = async (workspaceId: string, projectId: string): Promise<ITask[]> => {
  try {
    const response = await fetch(`/api/task/workspace/${workspaceId}/project/${projectId}/board`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

const updateTaskStatus = async (
  taskId: string, 
  workspaceId: string, 
  projectId: string, 
  newStatus: TaskStatus
): Promise<boolean> => {
  try {
    const response = await fetch(
      `/api/task/${taskId}/workspace/${workspaceId}/project/${projectId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
};

// Initial columns definition based on task status enum
const initialColumns: IColumn[] = [
  { id: 'BACKLOG', title: 'Backlog', tasks: [] },
  { id: 'TODO', title: 'To Do', tasks: [] },
  { id: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
  { id: 'IN_REVIEW', title: 'In Review', tasks: [] },
  { id: 'DONE', title: 'Done', tasks: [] },
];

export const useBoard = (workspaceId: string, projectId: string) => {
  const [board, setBoard] = useState<IBoard>({ columns: initialColumns });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from the server
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tasks = await fetchTasksForBoard(workspaceId, projectId);
      
      // Group tasks by status
      const newColumns = initialColumns.map(column => ({
        ...column,
        tasks: tasks.filter(task => task.status === column.id),
      }));
      
      setBoard({ columns: newColumns });
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  // Handle moving a task between columns (changing status)
  const moveTask = useCallback(async (
    taskId: string,
    source: DraggableLocation,
    destination: DraggableLocation
  ) => {
    // If dropped in the same location, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Create a deep copy of the board to modify
    const newBoard = {
      columns: board.columns.map(col => ({
        ...col,
        tasks: [...col.tasks]
      }))
    };
    
    // Find the source and destination columns
    const sourceColIndex = newBoard.columns.findIndex(col => col.id === source.droppableId);
    const destColIndex = newBoard.columns.findIndex(col => col.id === destination.droppableId);
    
    if (sourceColIndex === -1 || destColIndex === -1) {
      console.error('Could not find the source or destination column');
      return;
    }
    
    // Get the task being moved
    const [movedTask] = newBoard.columns[sourceColIndex].tasks.splice(source.index, 1);
    
    // Update task status to match destination column
    const updatedTask = { 
      ...movedTask, 
      status: newBoard.columns[destColIndex].id 
    };
    
    // Add task to destination column
    newBoard.columns[destColIndex].tasks.splice(destination.index, 0, updatedTask);
    
    // Update state optimistically
    setBoard(newBoard);
    
    // Call API to update the task status
    const success = await updateTaskStatus(
      taskId,
      workspaceId,
      projectId,
      updatedTask.status
    );
    
    // If the API call fails, reload the board to get the current state
    if (!success) {
      await loadTasks();
    }
  }, [board, workspaceId, projectId, loadTasks]);

  // Initial load of tasks
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    board,
    loading,
    error,
    moveTask,
    refreshBoard: loadTasks,
  };
};