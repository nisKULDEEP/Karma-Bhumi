import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { TaskStatusEnum } from "@/types/task.types";

const useCreateTaskDialog = () => {
  const [open, setOpen] = useQueryState(
    "new-task",
    parseAsBoolean.withDefault(false)
  );
  
  const [initialStatus, setInitialStatus] = useQueryState(
    "task-status",
    parseAsString.withDefault("")
  );

  const onOpen = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setInitialStatus("");
  };
  
  const onOpenWithStatus = (status: TaskStatusEnum) => {
    setInitialStatus(status);
    setOpen(true);
  };

  return {
    open,
    initialStatus,
    onOpen,
    onClose,
    onOpenWithStatus,
  };
};

export default useCreateTaskDialog;