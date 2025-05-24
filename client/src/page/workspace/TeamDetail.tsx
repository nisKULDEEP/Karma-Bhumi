import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getTeamByIdQueryFn,
  getTeamMembersQueryFn,
  getTeamProjectsQueryFn,
  deleteTeamMutationFn
} from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { Button } from "@/components/ui/Button";
import { 
  MoreHorizontal, Users, Folder, ArrowLeft, 
  Edit, Trash2, PlusCircle, Loader
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import TeamMembersList from "@/components/workspace/team/team-members-list";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateProjectForm from "@/components/workspace/project/create-project-form";

export default function TeamDetail() {
  const { workspaceId, teamId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  const canEditTeam = hasPermission(Permissions.EDIT_TEAM);
  const canDeleteTeam = hasPermission(Permissions.DELETE_TEAM);
  const canCreateProject = hasPermission(Permissions.CREATE_PROJECT);
  
  // Navigate back to teams list if teamId is missing
  useEffect(() => {
    if (!teamId) {
      navigate(`/workspace/${workspaceId}/teams`);
    }
  }, [teamId, workspaceId, navigate]);
  
  // Get team details
  const { 
    data: teamData, 
    isLoading: isLoadingTeam,
    error: teamError
  } = useQuery({
    queryKey: ["team", workspaceId, teamId],
    queryFn: () => getTeamByIdQueryFn({ workspaceId, teamId }),
    enabled: !!workspaceId && !!teamId,
  });
  
  // Get team members
  const {
    data: membersData,
    isLoading: isLoadingMembers
  } = useQuery({
    queryKey: ["team-members", workspaceId, teamId],
    queryFn: () => getTeamMembersQueryFn(workspaceId, teamId),
    enabled: !!workspaceId && !!teamId,
  });
  
  // Get team projects
  const {
    data: projectsData,
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: ["team-projects", workspaceId, teamId],
    queryFn: () => getTeamProjectsQueryFn({ workspaceId, teamId }),
    enabled: !!workspaceId && !!teamId,
  });
  
  // Delete team mutation
  const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
    mutationFn: deleteTeamMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", workspaceId] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
        variant: "success",
      });
      navigate(`/workspace/${workspaceId}/teams`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    },
  });
  
  // Handle team deletion
  const handleDeleteTeam = () => {
    if (isDeleting) return;
    
    deleteTeam({
      workspaceId,
      teamId,
    });
  };
  
  // Handle error states
  if (teamError) {
    return (
      <div className="w-full h-auto pt-2">
        <WorkspaceHeader />
        <Separator className="my-4" />
        <main>
          <div className="w-full max-w-3xl mx-auto pt-3 text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Team</h2>
            <p className="text-muted-foreground mb-4">
              {teamError.message || "Failed to load team details"}
            </p>
            <Button variant="outline" onClick={() => navigate(`/workspace/${workspaceId}/teams`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const team = teamData?.team;
  const members = membersData?.members || [];
  const projects = projectsData?.projects || [];
  
  return (
    <div className="w-full h-auto pt-2">
      <WorkspaceHeader />
      <Separator className="my-4" />
      <main>
        <div className="w-full max-w-5xl mx-auto pt-3">
          {/* Back navigation */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="p-0 h-8"
              onClick={() => navigate(`/workspace/${workspaceId}/teams`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Teams
            </Button>
          </div>
          
          {/* Team header */}
          {isLoadingTeam ? (
            <div className="flex justify-center my-12">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{team?.name}</h1>
                  <p className="text-muted-foreground text-sm mb-2">
                    {team?.description || "No description provided"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created on {formatDate(team?.createdAt)} • Last updated on {formatDate(team?.updatedAt)}
                  </p>
                </div>
                
                {/* Team actions dropdown */}
                {(canEditTeam || canDeleteTeam) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEditTeam && (
                        <DropdownMenuItem 
                          onClick={() => navigate(`/workspace/${workspaceId}/team/${teamId}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Team
                        </DropdownMenuItem>
                      )}
                      {canDeleteTeam && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setIsDeleteModalOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Team
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {/* Team content tabs */}
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
                
                {/* Overview tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Members summary card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md flex items-center">
                          <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                          Team Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingMembers ? (
                          <div className="flex justify-center p-4">
                            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <>
                            <div className="flex -space-x-2 mb-3">
                              {members.slice(0, 5).map((member, index) => (
                                <Avatar key={index} className="border-2 border-background h-8 w-8">
                                  <AvatarImage 
                                    src={member.userId?.profilePicture || ""} 
                                    alt={member.userId?.name}
                                  />
                                  <AvatarFallback className={getAvatarColor(member.userId?.name)}>
                                    {getAvatarFallbackText(member.userId?.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {members.length > 5 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                                  +{members.length - 5}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {members.length} {members.length === 1 ? "member" : "members"} in this team
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-3"
                              onClick={() => setShowMembersModal(true)}
                            >
                              Manage Members
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Projects summary card */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md flex items-center">
                          <Folder className="h-5 w-5 mr-2 text-muted-foreground" />
                          Team Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoadingProjects ? (
                          <div className="flex justify-center p-4">
                            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground mb-3">
                              {projects.length} {projects.length === 1 ? "project" : "projects"} in this team
                            </p>
                            {projects.length > 0 ? (
                              <ul className="space-y-2 mb-3">
                                {projects.slice(0, 3).map((project) => (
                                  <li key={project._id} className="text-sm">
                                    <Link 
                                      to={`/workspace/${workspaceId}/project/${project._id}`}
                                      className="hover:underline"
                                    >
                                      {project.name}
                                    </Link>
                                  </li>
                                ))}
                                {projects.length > 3 && (
                                  <li className="text-xs text-muted-foreground">
                                    + {projects.length - 3} more projects
                                  </li>
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground mb-3">
                                No projects have been created for this team yet.
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setActiveTab("projects")}
                              >
                                View All
                              </Button>
                              {canCreateProject && (
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => setShowCreateProjectModal(true)}
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  New Project
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Members tab */}
                <TabsContent value="members">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-md">Team Members</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowMembersModal(true)}
                      >
                        Manage Members
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingMembers ? (
                        <div className="flex justify-center p-8">
                          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : members.length > 0 ? (
                        <div className="space-y-4">
                          {members.map((member) => (
                            <div key={member.userId._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.userId?.profilePicture || ""} alt={member.userId?.name} />
                                  <AvatarFallback className={getAvatarColor(member.userId?.name)}>
                                    {getAvatarFallbackText(member.userId?.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{member.userId.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.userId.email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No members have been added to this team yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Projects tab */}
                <TabsContent value="projects">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-md">Team Projects</CardTitle>
                      {canCreateProject && (
                        <Button 
                          size="sm"
                          onClick={() => setShowCreateProjectModal(true)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          New Project
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isLoadingProjects ? (
                        <div className="flex justify-center p-8">
                          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projects.map((project) => (
                            <Card key={project._id} className="overflow-hidden">
                              <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-md">
                                  <Link 
                                    to={`/workspace/${workspaceId}/project/${project._id}`}
                                    className="hover:underline"
                                  >
                                    {project.name}
                                  </Link>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Status: <span className="capitalize">{project.status}</span>
                                </p>
                                <p className="text-sm line-clamp-2">
                                  {project.description || "No description provided"}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">No projects have been created for this team yet.</p>
                          {canCreateProject && (
                            <Button 
                              onClick={() => setShowCreateProjectModal(true)}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Create a Project
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
          
          {/* Delete team confirmation dialog */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-2">Are you sure you want to delete this team?</p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. All members will be removed from the team.
                  {projects.length > 0 && ` ${projects.length} project(s) associated with this team will need to be reassigned or deleted first.`}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteTeam}
                  disabled={isDeleting || projects.length > 0}
                >
                  {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {projects.length > 0 ? "Cannot Delete" : "Delete Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Team members management dialog */}
          <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
            <DialogContent className="sm:max-w-lg">
              <TeamMembersList 
                teamId={teamId} 
                teamName={team?.name || "Team"} 
                onClose={() => setShowMembersModal(false)} 
              />
            </DialogContent>
          </Dialog>
          
          {/* Create project dialog */}
          <Dialog open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal}>
            <DialogContent className="sm:max-w-lg">
              <CreateProjectForm 
                teamId={teamId} 
                onClose={() => setShowCreateProjectModal(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}