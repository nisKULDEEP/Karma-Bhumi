import { parseAsBoolean, useQueryState } from "nuqs";
import { TaskType } from "@/types/api.type";
import { useState } from "react";

const useDeleteTaskDialog = () => {
  const [open, setOpen] = useQueryState(
    "delete-task",
    parseAsBoolean.withDefault(false)
  );
  const [taskToDelete, setTaskToDelete] = useState<TaskType | null>(null);

  const onOpen = (task: TaskType) => {
    setTaskToDelete(task);
    setOpen(true);
  };
  
  const onClose = () => {
    setOpen(false);
    setTaskToDelete(null);
  };
  
  return {
    open,
    onOpen,
    onClose,
    taskToDelete
  };
};

export default useDeleteTaskDialog;