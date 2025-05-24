import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader, AlertCircle } from 'lucide-react';

import { BoardHeader } from './BoardHeader';
import KanbanBoard from './KanbanBoard';
import ListView from './ListView';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  getBoardDetailsQueryFn, 
  updateBoardMutationFn, 
  deleteBoardMutationFn,
  updateTaskStatusMutationFn
} from '@/lib/api/index';
import { BoardType } from '@/hooks/use-create-board-dialog';
import { TaskStatusEnum } from '@/types/task.types';
import useWorkspaceId from '@/hooks/use-workspace-id';
import AddTaskDialog from '@/components/workspace/task/create-task-dialog';

interface BoardViewContainerProps {
  boardId: string;
  projectId: string;
  onDeletedBoard?: () => void;
}

export const BoardViewContainer = ({
  boardId,
  projectId,
  onDeletedBoard
}: BoardViewContainerProps) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const [currentBoardType, setCurrentBoardType] = useState<BoardType>(BoardType.KANBAN);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [taskInitialStatus, setTaskInitialStatus] = useState<TaskStatusEnum | null>(null);

  // Fetch board details
  const { 
    data: boardData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoardDetailsQueryFn({
      workspaceId: workspaceId as string,
      projectId,
      boardId
    }),
    enabled: !!boardId && !!workspaceId && !!projectId,
  });

  // Update board mutation
  const updateBoardMutation = useMutation({
    mutationFn: updateBoardMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    }
  });

  // Delete board mutation
  const deleteBoardMutation = useMutation({
    mutationFn: deleteBoardMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-boards', projectId] });
      if (onDeletedBoard) {
        onDeletedBoard();
      }
    }
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: updateTaskStatusMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    }
  });

  // Set initial board type from data when available
  useEffect(() => {
    if (boardData?.board?.type) {
      setCurrentBoardType(boardData.board.type as BoardType);
    }
  }, [boardData]);

  // Handle board type change
  const handleChangeBoardType = (type: BoardType) => {
    setCurrentBoardType(type);
    
    // Update board type in the database
    if (boardData?.board) {
      updateBoardMutation.mutate({
        workspaceId: workspaceId as string,
        projectId,
        boardId,
        data: {
          type
        }
      });
    }
  };

  // Handle board rename
  const handleRenameBoard = (newName: string) => {
    if (boardData?.board) {
      updateBoardMutation.mutate({
        workspaceId: workspaceId as string,
        projectId,
        boardId,
        data: {
          name: newName
        }
      });
    }
  };

  // Handle board delete
  const handleDeleteBoard = () => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      deleteBoardMutation.mutate({
        workspaceId: workspaceId as string,
        projectId,
        boardId
      });
    }
  };

  // Handle task drag and drop
  const handleTaskMove = async (taskId: string, newStatus: TaskStatusEnum) => {
    return updateTaskStatusMutation.mutateAsync({
      workspaceId: workspaceId as string,
      projectId,
      taskId,
      data: {
        status: newStatus
      }
    });
  };

  // Handle creating a new task
  const handleCreateTask = (status: TaskStatusEnum) => {
    setTaskInitialStatus(status);
    setShowAddTaskDialog(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (error || !boardData) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load board data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BoardHeader
        boardId={boardId}
        boardName={boardData.board.name}
        projectId={projectId}
        boardType={currentBoardType}
        onChangeBoardType={handleChangeBoardType}
        onRenameBoard={handleRenameBoard}
        onDeleteBoard={handleDeleteBoard}
      />
      
      <div className="flex-1 overflow-hidden">
        {currentBoardType === BoardType.KANBAN && (
          <KanbanBoard
            tasks={boardData.tasks || []}
            onTaskMove={handleTaskMove}
            onCreateTask={handleCreateTask}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}
        
        {currentBoardType === BoardType.LIST && (
          <ListView
            tasks={boardData.tasks || []}
            onTaskStatusChange={handleTaskMove}
            onCreateTask={() => handleCreateTask(TaskStatusEnum.TODO)}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )}
        
        {currentBoardType === BoardType.GANTT && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Gantt chart view coming soon</p>
          </div>
        )}
      </div>
      
      {showAddTaskDialog && (
        <AddTaskDialog
          projectId={projectId}
          initialStatus={taskInitialStatus || undefined}
          isOpen={showAddTaskDialog}
          onClose={() => {
            setShowAddTaskDialog(false);
            setTaskInitialStatus(null);
          }}
        />
      )}
    </div>
  );
};

export default BoardViewContainer;