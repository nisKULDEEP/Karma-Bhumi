import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";

const AppHeader: React.FC = () => {
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          {/* Page title can be dynamic based on current route */}
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/workspace/${workspaceId}/new-task`)}>
          New Task
        </Button>
        <Button size="sm" onClick={onOpen}>
          New Project
        </Button>
        <div className="relative">
          <Bell className="h-5 w-5 cursor-pointer" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"></span>
        </div>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
          <AvatarFallback>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AppHeader;