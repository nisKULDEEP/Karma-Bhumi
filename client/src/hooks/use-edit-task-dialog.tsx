import { parseAsBoolean, useQueryState } from "nuqs";
import { TaskType } from "@/types/api.type";
import { useState } from "react";

const useEditTaskDialog = () => {
  const [open, setOpen] = useQueryState(
    "edit-task",
    parseAsBoolean.withDefault(false)
  );
  const [taskToEdit, setTaskToEdit] = useState<TaskType | null>(null);

  const onOpen = (task: TaskType) => {
    setTaskToEdit(task);
    setOpen(true);
  };
  
  const onClose = () => {
    setOpen(false);
    setTaskToEdit(null);
  };
  
  return {
    open,
    onOpen,
    onClose,
    taskToEdit
  };
};

export default useEditTaskDialog;