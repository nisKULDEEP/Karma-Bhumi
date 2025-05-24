import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Users } from "lucide-react";
import TeamMembersList from "./team-members-list";

interface TeamMembersDialogProps {
  teamId: string;
  teamName: string;
}

const TeamMembersDialog = ({ teamId, teamName }: TeamMembersDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={onOpen}>
          <Users className="h-4 w-4 mr-1" />
          Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <TeamMembersList teamId={teamId} teamName={teamName} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default TeamMembersDialog;