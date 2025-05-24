import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";

const useTaskDetailsDialog = () => {
  const [open, setOpen] = useQueryState(
    "task",
    parseAsBoolean.withDefault(false)
  );
  
  const [taskId, setTaskId] = useQueryState(
    "taskId",
    parseAsString.withDefault("")
  );

  const onOpen = (id: string) => {
    setTaskId(id);
    setOpen(true);
  };
  
  const onClose = () => {
    setOpen(false);
    setTaskId("");
  };

  return {
    open,
    taskId,
    onOpen,
    onClose,
  };
};

export default useTaskDetailsDialog;
export { useTaskDetailsDialog };