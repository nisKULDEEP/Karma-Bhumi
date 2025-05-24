import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Trash2, Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeamMutationFn } from "@/lib/api/index";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DeleteTeamDialogProps {
  teamId: string;
  teamName: string;
}

const DeleteTeamDialog = ({ teamId, teamName }: DeleteTeamDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();
  
  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTeamMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", workspaceId] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
        variant: "success",
      });
      
      // Navigate back to teams list
      navigate(`/workspace/${workspaceId}/teams`);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    mutate({
      workspaceId,
      teamId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" onClick={onOpen}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the team "{teamName}"? This action cannot be undone.
            All projects associated with this team will be disassociated but not deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamDialog;