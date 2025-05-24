import {
  ArrowRight,
  Folder,
  Loader,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar/sidebarComponents";
import { useSidebar } from "@/context/sidebar-context";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { Button } from "@/components/ui/Button";
import { Permissions } from "@/constant";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { useState } from "react";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { PaginationType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectMutationFn } from "@/lib/api/index";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { collapsed } = useSidebar();

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const isMobile = useIsMobile();
  const { onOpen } = useCreateProjectDialog();
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog();

  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  });

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const projects = data?.projects || [];
  const pagination = data?.pagination || ({} as PaginationType);
  const hasMore = pagination?.totalPages > pageNumber;

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleConfirm = () => {
    if (!context) return;
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });

          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  
  return (
    <TooltipProvider>
      <SidebarMenu className={cn(
        "h-[320px] scrollbar overflow-y-auto pb-2",
        collapsed && "flex flex-col items-center"
      )}>
        {isError ? <div className={cn(collapsed && "text-center")}>Error occured</div> : null}
        {isPending ? (
          <Loader
            className="w-5 h-5 animate-spin place-self-center"
          />
        ) : null}

        {!isPending && projects?.length === 0 ? (
          <div className={cn(
            "pl-3",
            collapsed && "pl-0 text-center"
          )}>
            {!collapsed && (
              <>
                <p className="text-xs text-muted-foreground">
                  There is no projects in this Workspace yet. Projects you create
                  will show up here.
                </p>
                <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                  <Button
                    variant="link"
                    type="button"
                    className="h-0 p-0 text-[13px] underline font-semibold mt-4"
                    onClick={onOpen}
                  >
                    Create a project
                    <ArrowRight />
                  </Button>
                </PermissionsGuard>
              </>
            )}
          </div>
        ) : (
          projects.map((item) => {
            const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;

            return (
              <SidebarMenuItem key={item._id}>
                <SidebarMenuButton 
                  asChild 
                  isActive={projectUrl === pathname}
                  tooltip={collapsed ? item.name : undefined}
                  className={cn(
                    collapsed && "justify-center"
                  )}
                >
                  <Link to={projectUrl}>
                    <span className={cn(collapsed && "mx-auto")}>{item.emoji}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </SidebarMenuButton>
                {!collapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`${projectUrl}`)}
                      >
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>

                      <PermissionsGuard
                        requiredPermission={Permissions.DELETE_PROJECT}
                      >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isLoading}
                          onClick={() => onOpenDialog(item)}
                        >
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </SidebarMenuItem>
            );
          })
        )}

        {hasMore && !collapsed && (
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              disabled={isFetching}
              onClick={fetchNextPage}
            >
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>{isFetching ? "Loading..." : "More"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        
        <ConfirmDialog
          isOpen={open}
          isLoading={isLoading}
          onClose={onCloseDialog}
          onConfirm={handleConfirm}
          title="Delete Project"
          description={`Are you sure you want to delete ${
            context?.name || "this item"
          }? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </SidebarMenu>
    </TooltipProvider>
  );
}