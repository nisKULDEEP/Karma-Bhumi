import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import CreateTaskForm from "./create-task-form";
import useCreateTaskDialog from "@/hooks/use-create-task-dialog";
import { Plus } from "lucide-react";

const CreateTaskDialog = (props: { projectId?: string; hideButton?: boolean }) => {
  const { open, initialStatus, onClose, onOpen } = useCreateTaskDialog();

  return (
    <div>
      <Dialog modal={true} open={open} onOpenChange={(isOpen) => isOpen ? onOpen() : onClose()}>
        {!props.hideButton && (
          <DialogTrigger>
            <Button>
              <Plus />
              New Task
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
          <CreateTaskForm 
            projectId={props.projectId} 
            initialStatus={initialStatus}
            onClose={onClose} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTaskDialog;
