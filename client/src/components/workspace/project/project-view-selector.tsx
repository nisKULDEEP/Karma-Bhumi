import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProjectViewSelectorProps {
  workspaceId: string;
  projectId: string;
}

const ProjectViewSelector: FC<ProjectViewSelectorProps> = ({ workspaceId, projectId }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isBoardView = pathname.includes("/board");
  const isListView = !isBoardView;

  const baseUrl = `/workspace/${workspaceId}/project/${projectId}`;
  const boardUrl = `${baseUrl}/board`;

  return (
    <div className="flex space-x-1 border rounded-md overflow-hidden">
      <Link to={baseUrl}>
        <Button 
          size="sm" 
          variant={isListView ? "default" : "ghost"}
          className={cn(
            "rounded-none px-3 h-8",
            isListView && "hover:bg-primary"
          )}
        >
          <List className="h-4 w-4 mr-1" />
          List
        </Button>
      </Link>
      <Link to={boardUrl}>
        <Button 
          size="sm" 
          variant={isBoardView ? "default" : "ghost"}
          className={cn(
            "rounded-none px-3 h-8",
            isBoardView && "hover:bg-primary"
          )}
        >
          <LayoutGrid className="h-4 w-4 mr-1" />
          Board
        </Button>
      </Link>
    </div>
  );
};

export default ProjectViewSelector;