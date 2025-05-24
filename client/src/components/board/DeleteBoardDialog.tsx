import React, { useState } from 'react';
import { Loader, Trash } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface DeleteBoardDialogProps {
  boardName: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteBoardDialog = ({
  boardName,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: DeleteBoardDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmDisabled = confirmText !== boardName;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash className="h-5 w-5" />
            Delete Board
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the board
            and all its tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-2 text-sm text-muted-foreground">
            To confirm, type <span className="font-semibold">{boardName}</span> below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={boardName}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirmDisabled || isLoading}
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBoardDialog;