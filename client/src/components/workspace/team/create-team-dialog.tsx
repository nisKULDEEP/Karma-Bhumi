import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import CreateTeamForm from "./create-team-form";

const CreateTeamDialog = () => {
  const [open, setOpen] = useState(false);
  
  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={onOpen}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <CreateTeamForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;