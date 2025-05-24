import React from "react";
import { useQuery } from "@tanstack/react-query";
// import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/separator";
import { Loader, Users, ChevronRight } from "lucide-react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getTeamsInWorkspaceQueryFn } from "@/lib/api/index";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { Link } from "react-router-dom";
import TeamMembersDialog from "./team-members-dialog";
import EditTeamDialog from "./edit-team-dialog";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";

const TeamsList = () => {
  const workspaceId = useWorkspaceId();
  const { hasPermission } = useAuthContext();
  const canEditTeam = hasPermission(Permissions.EDIT_TEAM);
  
  const { data, isLoading } = useQuery({
    queryKey: ["teams", workspaceId],
    queryFn: () => getTeamsInWorkspaceQueryFn({ workspaceId }),
    enabled: !!workspaceId,
  });
  
  const teams = data?.teams || [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  if (teams.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">No teams found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Create a team to organize projects and members within your workspace.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6">
      {teams.map((team) => (
        <Card key={team._id} className="hover:shadow-sm transition-shadow">
          <Link to={`/workspace/${workspaceId}/team/${team._id}`} className="block card-click-wrapper">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary rounded-md">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{team.name}</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground">{team.description || "No description provided"}</p>
              
              <div className="mt-4 flex justify-between text-sm">
                <div>
                  <p><span className="font-semibold">Projects:</span> {team.projectCount || 0}</p>
                  <p><span className="font-semibold">Members:</span> {team.memberCount || 0}</p>
                </div>
                
                <div className="space-x-2 z-10 relative" onClick={(e) => e.stopPropagation()}>
                  <TeamMembersDialog teamId={team._id} teamName={team.name} />
                  {canEditTeam && <EditTeamDialog team={team} />}
                </div>
              </div>
            </CardContent>
          </Link>
          
          <Separator />
          
          <CardFooter className="pt-4">
            <div className="w-full flex space-x-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/workspace/${workspaceId}/team/${team._id}`}>
                  View Team <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/workspace/${workspaceId}/teams/${team._id}/projects`}>
                  View Projects <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TeamsList;