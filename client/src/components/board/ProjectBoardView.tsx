import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ListFilter, Plus, LayoutDashboard, ListTodo, GanttChart } from 'lucide-react';

import Board from './Board';
import ListView from './ListView';
import useWorkspaceId from '@/hooks/use-workspace-id';
import useCreateBoardDialog from '@/hooks/use-create-board-dialog';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { useAuthContext } from '@/context/auth-provider';
import { Permissions } from '@/constant';
import { getBoardsQueryFn } from '@/lib/api/index';
import { Skeleton } from '../ui/skeleton';

// Types for board view
type ViewType = 'kanban' | 'list' | 'gantt';

const ProjectBoardView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const workspaceId = useWorkspaceId();
  const { hasPermission } = useAuthContext();
  const { onOpen } = useCreateBoardDialog();
  
  const canCreateBoards = hasPermission(Permissions.CREATE_PROJECT);
  
  // States for the component
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  
  // Fetch boards for the current project
  const { data: boardsData, isLoading } = useQuery({
    queryKey: ['boards', workspaceId, projectId],
    queryFn: () => getBoardsQueryFn({ 
      workspaceId: workspaceId as string,
      projectId: projectId as string
    }),
    enabled: !!workspaceId && !!projectId,
  });
  
  const boards = boardsData?.boards || [];

  // When boards are loaded, select the first one by default
  useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0]._id);
      // Set the view based on the board type
      setCurrentView((boards[0].type || 'kanban') as ViewType);
    }
  }, [boards, selectedBoardId]);

  // Handle board selection change
  const handleBoardChange = (boardId: string) => {
    const board = boards.find(b => b._id === boardId);
    setSelectedBoardId(boardId);
    if (board) {
      setCurrentView((board.type || 'kanban') as ViewType);
    }
  };

  // Handle view type change
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  // If there are no boards yet, show a welcome screen
  if (boards.length === 0) {
    return (
      <Card className="w-full border-dashed">
        <CardHeader>
          <CardTitle>No Boards Found</CardTitle>
          <CardDescription>
            Create your first board to start visualizing your work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 flex-col">
            <LayoutDashboard className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-center mb-6 text-muted-foreground">
              Boards help you organize tasks by status, priority, or custom workflows
            </p>
            {canCreateBoards && (
              <Button onClick={onOpen}>
                <Plus className="mr-2 h-4 w-4" /> Create Board
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Render the board view with selector and controls
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div className="w-full md:w-64">
          <Select value={selectedBoardId || undefined} onValueChange={handleBoardChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a board" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Available Boards</SelectLabel>
                {boards.map((board) => (
                  <SelectItem key={board._id} value={board._id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button 
              variant={currentView === 'kanban' ? 'secondary' : 'ghost'} 
              className="px-3 rounded-r-none"
              onClick={() => handleViewChange('kanban')}
              title="Kanban View"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Kanban</span>
            </Button>
            <Button 
              variant={currentView === 'list' ? 'secondary' : 'ghost'} 
              className="px-3 rounded-none border-l"
              onClick={() => handleViewChange('list')}
              title="List View"
            >
              <ListTodo className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">List</span>
            </Button>
            <Button 
              variant={currentView === 'gantt' ? 'secondary' : 'ghost'} 
              className="px-3 rounded-l-none border-l"
              onClick={() => handleViewChange('gantt')}
              title="Gantt View"
            >
              <GanttChart className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Gantt</span>
            </Button>
          </div>
          
          <Button variant="outline" size="icon" title="Filter Tasks">
            <ListFilter className="h-4 w-4" />
          </Button>
          
          {canCreateBoards && (
            <Button onClick={onOpen}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Board</span>
            </Button>
          )}
        </div>
      </div>

      {/* The board content area */}
      <div className="mt-4">
        {currentView === 'kanban' && selectedBoardId && (
          <Board 
            boardId={selectedBoardId}
            workspaceId={workspaceId}
            projectId={projectId as string}
          />
        )}
        
        {currentView === 'list' && selectedBoardId && (
          <ListView 
            boardId={selectedBoardId}
            workspaceId={workspaceId}
            projectId={projectId as string}
          />
        )}
        
        {currentView === 'gantt' && (
          <div className="flex items-center justify-center h-[400px] border rounded-md bg-gray-50">
            <div className="text-center">
              <GanttChart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Gantt View Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on the Gantt chart view for better timeline management
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBoardView;