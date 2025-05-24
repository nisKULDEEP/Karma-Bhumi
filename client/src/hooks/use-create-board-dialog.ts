import { useState, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBoardMutationFn } from '@/lib/api/index';
import useWorkspaceId from './use-workspace-id';
import { toast } from './use-toast';

// Atom to store the dialog open state
const createBoardDialogOpenAtom = atom(false);

// Enum for board types
export enum BoardType {
  KANBAN = 'kanban',
  LIST = 'list',
  GANTT = 'gantt'
}

// Hook for the create board dialog
const useCreateBoardDialog = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  
  const [open, setOpen] = useAtom(createBoardDialogOpenAtom);
  const [isLoading, setIsLoading] = useState(false);

  // Create board mutation
  const { mutate } = useMutation({
    mutationFn: createBoardMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['boards', workspaceId, projectId],
      });
      toast({
        title: 'Success',
        description: 'Board created successfully',
        variant: 'success',
      });
      setOpen(false);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create board',
        variant: 'destructive',
      });
      setIsLoading(false);
    },
  });

  // Open the dialog
  const onOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  // Close the dialog
  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // Create a new board
  const createBoard = useCallback(
    (data: { name: string; description?: string; type: BoardType }) => {
      if (!workspaceId || !projectId) return;
      
      setIsLoading(true);
      
      mutate({
        workspaceId,
        projectId,
        name: data.name,
        description: data.description,
        type: data.type,
      });
    },
    [workspaceId, projectId, mutate]
  );

  return {
    open,
    isLoading,
    onOpen,
    onClose,
    createBoard,
  };
};

export default useCreateBoardDialog;