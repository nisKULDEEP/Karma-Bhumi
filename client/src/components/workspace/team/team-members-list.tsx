import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader, PlusCircle, Search, X } from "lucide-react";
import useWorkspaceId from "@/hooks/use-workspace-id";
// Import directly from team.api.ts to avoid conflicting exports
// import { getTeamMembersQueryFn } from "@/lib/api/team.api";
import { getTeamMembersQueryFn, addTeamMemberMutationFn, removeTeamMemberMutationFn, getWorkspaceMembersQueryFn } from "@/lib/api/index";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamMembersListProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

const TeamMembersList = ({ teamId, teamName, onClose }: TeamMembersListProps) => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { hasPermission, user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToAdd, setMemberToAdd] = useState("");
  
  const canAddMember = hasPermission(Permissions.ADD_MEMBER);
  const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);
  
  // Fetch team members
  const { data, isLoading } = useQuery({
    queryKey: ["team-members", workspaceId, teamId],
    queryFn: () => getTeamMembersQueryFn(workspaceId, teamId),
    enabled: !!workspaceId && !!teamId,
  });
  
  // Fetch workspace members for adding to team
  const { data: workspaceMembersData, isLoading: isLoadingWorkspaceMembers } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getWorkspaceMembersQueryFn({ workspaceId }),
    enabled: !!workspaceId && canAddMember,
  });
  
  // Add member mutation
  const { mutate: addMember, isPending: isAddingMember } = useMutation({
    mutationFn: addTeamMemberMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", workspaceId, teamId] });
      setMemberToAdd("");
      toast({
        title: "Success",
        description: "Member added to team successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove member mutation
  const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
    mutationFn: removeTeamMemberMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", workspaceId, teamId] });
      toast({
        title: "Success",
        description: "Member removed from team successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle adding a member to the team
  const handleAddMember = () => {
    if (!memberToAdd) return;
    
    addMember({
      workspaceId,
      teamId,
      userId: memberToAdd,
    });
  };
  
  // Handle removing a member from the team
  const handleRemoveMember = (userId: string) => {
    removeMember({
      workspaceId,
      teamId,
      userId,
    });
  };
  
  const teamMembers = data?.members || [];
  const workspaceMembers = workspaceMembersData?.members || [];
  
  // Filter workspace members who aren't already in the team
  const availableMembers = workspaceMembers.filter(
    (wMember) => !teamMembers.some((tMember) => tMember.userId._id === wMember.userId._id)
  );
  
  // Filter team members based on search term
  const filteredTeamMembers = searchTerm 
    ? teamMembers.filter((member) => 
        member.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teamMembers;
  
  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 border-b pb-2">
          <h1 className="text-xl tracking-[-0.16px] font-semibold mb-1 text-center sm:text-left">
            {teamName} - Team Members
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Manage members in this team
          </p>
        </div>
        
        {/* Search and add member section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>
          
          {canAddMember && (
            <div className="mt-4">
              <div className="flex items-center">
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={memberToAdd}
                  onChange={(e) => setMemberToAdd(e.target.value)}
                  disabled={isLoadingWorkspaceMembers || isAddingMember}
                >
                  <option value="">Select a member to add</option>
                  {availableMembers.map((member) => (
                    <option key={member.userId._id} value={member.userId._id}>
                      {member.userId.name} ({member.userId.email})
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={handleAddMember}
                  disabled={!memberToAdd || isAddingMember}
                  className="ml-2"
                >
                  {isAddingMember ? <Loader className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-1" />}
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Team members list */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredTeamMembers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No members found</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {filteredTeamMembers.map((member) => {
                const name = member.userId?.name;
                const initials = getAvatarFallbackText(name);
                const avatarColor = getAvatarColor(name);
                
                return (
                  <div key={member.userId._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
                        <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{member.userId.email}</p>
                      </div>
                    </div>
                    
                    {canRemoveMember && member.userId._id !== user?._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId._id)}
                        disabled={isRemovingMember}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        <span className="sr-only">Remove member</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersList;