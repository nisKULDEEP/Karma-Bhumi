import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import ProjectCard from "@/components/workspace/project/project-card";
import { getTeamByIdQueryFn, getTeamProjectsQueryFn } from "@/lib/api/index";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { Link } from "react-router-dom";
import DeleteTeamDialog from "@/components/workspace/team/delete-team-dialog";
import TeamMembersDialog from "@/components/workspace/team/team-members-dialog";
import EditTeamDialog from "@/components/workspace/team/edit-team-dialog";

export default function TeamProjects() {
  const { workspaceId, teamId } = useParams<{ workspaceId: string; teamId: string }>();
  const { hasPermission } = useAuthContext();
  const { onOpen } = useCreateProjectDialog();
  
  const canCreateProject = hasPermission(Permissions.CREATE_PROJECT);
  const canEditTeam = hasPermission(Permissions.EDIT_TEAM);
  const canDeleteTeam = hasPermission(Permissions.EDIT_TEAM);
  
  // Fetch team details
  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team", workspaceId, teamId],
    queryFn: () => getTeamByIdQueryFn({ workspaceId: workspaceId!, teamId: teamId! }),
    enabled: !!workspaceId && !!teamId,
  });
  
  // Fetch team projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["team-projects", workspaceId, teamId],
    queryFn: () => getTeamProjectsQueryFn({ workspaceId: workspaceId!, teamId: teamId! }),
    enabled: !!workspaceId && !!teamId,
  });
  
  const team = teamData?.team;
  const projects = projectsData?.projects || [];
  const isLoading = isLoadingTeam || isLoadingProjects;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="w-full h-auto pt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to={`/workspace/${workspaceId}/teams`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{team?.name} - Projects</h1>
            <p className="text-muted-foreground">
              Manage projects for this team
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEditTeam && team && (
            <>
              <TeamMembersDialog teamId={team._id} teamName={team.name} />
              <EditTeamDialog team={team} />
              {canDeleteTeam && (
                <DeleteTeamDialog teamId={team._id} teamName={team.name} />
              )}
            </>
          )}
          {canCreateProject && (
            <Button onClick={onOpen}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>
              This team doesn't have any projects yet. Create your first project to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreateProject && (
              <Button onClick={onOpen}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}