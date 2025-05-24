import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton = ({ onClick }: AddTaskButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0" 
      onClick={onClick}
      title="Add new task"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
};

export default AddTaskButton;