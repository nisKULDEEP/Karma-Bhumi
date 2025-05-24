import { parseAsBoolean, useQueryState } from "nuqs";

const useCreateTeamDialog = () => {
  const [open, setOpen] = useQueryState(
    "new-team",
    parseAsBoolean.withDefault(false)
  );

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);
  
  return {
    open,
    onOpen,
    onClose,
  };
};

export default useCreateTeamDialog;