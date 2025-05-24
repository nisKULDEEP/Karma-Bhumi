import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import EditTeamForm from "./edit-team-form";
import { TeamType } from "@/types/api.type";

// Updated to accept a partial team object with just the properties we need
interface EditTeamDialogProps {
  team: Pick<TeamType, '_id' | 'name' | 'description'> & {
    memberCount?: number;
    projectCount?: number;
  };
}

const EditTeamDialog = ({ team }: EditTeamDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={onOpen}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <EditTeamForm team={team} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamDialog;