import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, EllipsisIcon, Loader, LogOut, PanelLeft, Plus, Settings, User, Users2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarGroupLabel,
} from "@/components/sidebar/sidebarComponents";

// Import the correct useSidebar from the context
import { useSidebar } from "@/context/sidebar-context";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { NavMain } from "./NavMain";
import { NavProjects } from "./NavProjects";
// import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import LogoutDialog from "./LogoutDialog";
import { Button } from "@/components/ui/Button";
import { Permissions } from "@/constant";
import PermissionsGuard from "@/components/resuable/permission-guard";
// import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { useQueryState, parseAsBoolean } from "nuqs";
import { cn } from "@/lib/utils";
import { TeamDialog } from "@/components/team/TeamDialog";
import { ProjectDialog } from "@/components/project/ProjectDialog";
import { getAllTeamsQueryFn } from "@/lib/api/team.api";
import { TeamType } from "@/types/api.type";

const AppSidebar: React.FC = () => {
  const { isLoading, user, hasPermission } = useAuthContext();
  const { collapsed, toggleSidebar } = useSidebar();
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();
  // const { onOpen: openWorkspaceDialog } = useCreateWorkspaceDialog();
  
  // Dialogs state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  
  const handleTeamsToggle = () => setIsTeamsExpanded(prev => !prev);
  const handleProjectsToggle = () => setIsProjectsExpanded(prev => !prev);
  
  const canCreateTeam = hasPermission(Permissions.CREATE_TEAM);
  const canCreateProject = hasPermission(Permissions.CREATE_PROJECT);
  
  // Fetch teams from the backend
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams", workspaceId],
    queryFn: () => workspaceId ? getAllTeamsQueryFn(workspaceId) : Promise.reject("No workspace ID"),
    enabled: !!workspaceId,
  });
  
  // Teams from backend or empty array if loading/error
  const teams: TeamType[] = teamsData?.teams || [];
  
  const handleProfileClick = () => {
    if (workspaceId) {
      navigate(`/profile`);
    }
  };
  
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="!py-0 dark:bg-background">
          <div className="flex h-[50px] items-center justify-start w-full px-1">
            <Logo url={`/workspace/${workspaceId}`} />
            {!collapsed && (
              <Link
                to={`/workspace/${workspaceId}`}
                className="hidden md:flex ml-2 items-center gap-2 self-center font-medium"
              >
                KarmaBhumi
               
              </Link>
            )}
            <div className="ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={toggleSidebar}
                    >
                      <PanelLeft className={collapsed ? "rotate-180" : ""} size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="!mt-0 dark:bg-background">
          <SidebarGroup className="!py-0">
            <SidebarGroupContent>
              <WorkspaceSwitcher />
              <Separator />
              <NavMain />
              <Separator />

              {/* Teams Section */}
              <SidebarGroup className={cn(
                "group-data-[collapsible=icon]:hidden",
                collapsed && "flex items-center justify-center"
              )}>
                <SidebarGroupLabel className={cn(
                  "w-full justify-between pr-0 flex items-center",
                  collapsed && "justify-center"
                )}>
                  <div 
                    className={cn(
                      "flex items-center cursor-pointer",
                      collapsed && "justify-center"
                    )}
                    onClick={handleTeamsToggle}
                  >
                    <ChevronRight size={16} className={`mr-1 transition-transform ${isTeamsExpanded ? 'rotate-90' : ''}`} />
                    <span>Teams</span>
                  </div>
                  {canCreateTeam && !collapsed && (
                    <button
                      onClick={() => setTeamDialogOpen(true)}
                      type="button"
                      className="flex size-5 items-center justify-center rounded-full border hover:bg-sidebar-accent"
                      aria-label="Add team"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  )}
                </SidebarGroupLabel>
                
                {isTeamsExpanded && (
                  <SidebarMenu className={cn(
                    "scrollbar overflow-y-auto pb-2",
                    collapsed && "flex items-center justify-center"
                  )}>
                    {isLoadingTeams ? (
                      <div className="flex justify-center py-2">
                        <Loader size={16} className="animate-spin" />
                      </div>
                    ) : teams.length > 0 ? (
                      teams.map((team) => (
                        <SidebarMenuItem key={team._id}>
                          <SidebarMenuButton asChild className={cn(collapsed && "justify-center")}>
                            <Link to={`/workspace/${workspaceId}/team/${team._id}`}>
                              <Users2 size={16} />
                              <span>{team.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        No teams found
                      </div>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setTeamDialogOpen(true)}
                        className={cn(
                          "text-primary underline justify-center",
                          !collapsed && "justify-start"
                        )}
                      >
                        <Plus size={16} />
                        <span>Add Team</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </SidebarGroup>
              
              <Separator />
              
              {/* Projects Section with collapse toggle */}
              <SidebarGroup className={cn(
                "group-data-[collapsible=icon]:hidden",
                collapsed && "flex items-center justify-center"
              )}>
                <SidebarGroupLabel className={cn(
                  "w-full justify-between pr-0 flex items-center",
                  collapsed && "justify-center"
                )}>
                  <div 
                    className={cn(
                      "flex items-center cursor-pointer",
                      collapsed && "justify-center"
                    )}
                    onClick={handleProjectsToggle}
                  >
                    <ChevronRight size={16} className={`mr-1 transition-transform ${isProjectsExpanded ? 'rotate-90' : ''}`} />
                    <span>Projects</span>
                  </div>
                  {canCreateProject && !collapsed && (
                    <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                      <button
                        onClick={() => setProjectDialogOpen(true)}
                        type="button"
                        className="flex size-5 items-center justify-center rounded-full border hover:bg-sidebar-accent"
                        aria-label="Add project"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </PermissionsGuard>
                  )}
                </SidebarGroupLabel>
                
                {isProjectsExpanded && (
                  <>
                    <NavProjects />
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => setProjectDialogOpen(true)}
                        className={cn(
                          "text-primary underline justify-center",
                          !collapsed && "justify-start"
                        )}
                      >
                        <Plus size={16} />
                        <span>Add Project</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarGroup>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="dark:bg-background">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader
                  size="24px"
                  className="place-self-center self-center animate-spin"
                />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className={cn(
                        "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                        collapsed && "justify-center"
                      )}
                    >
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage src={user?.profilePicture || ""} />
                        <AvatarFallback className="rounded-full border border-gray-500">
                          {user?.name?.split(" ")?.[0]?.charAt(0)}
                          {user?.name?.split(" ")?.[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {!collapsed && (
                        <>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                              {user?.name}
                            </span>
                            <span className="truncate text-xs">{user?.email}</span>
                          </div>
                          <EllipsisIcon className="ml-auto size-4" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={"bottom"}
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleProfileClick}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        
        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      <TeamDialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} />
      <ProjectDialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} />
    </>
  );
};

export default AppSidebar;