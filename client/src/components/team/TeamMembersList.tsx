import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { InviteMemberModal } from "./InviteMemberModal";
import { useToast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/Badge";
import { getTeamMembersQueryFn } from "@/lib/api/team.api";

interface TeamMember {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  role: {
    _id: string;
    name: string;
  };
}

interface TeamMembersListProps {
  workspaceId: string;
  teamId?: string; // Optional: filter by team
}

export const TeamMembersList = ({ workspaceId, teamId }: TeamMembersListProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembersQueryFn(workspaceId, teamId);
      setMembers(data.members || []);
    } catch (error: any) {
      console.error("Failed to fetch team members:", error);
      toast({
        title: "Failed to load team members",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId, teamId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Team Members</CardTitle>
        <InviteMemberModal workspaceId={workspaceId} onSuccess={fetchMembers} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team members yet.</p>
            <p className="text-sm">Invite members to collaborate on this workspace.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.userId.profileImage} />
                    <AvatarFallback>
                      {getInitials(member.userId.name || member.userId.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.userId.name || "Unnamed User"}</div>
                    <div className="text-sm text-muted-foreground">{member.userId.email}</div>
                  </div>
                </div>
                <Badge variant="outline">{member.role.name}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};