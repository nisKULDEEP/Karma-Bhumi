import { useEffect } from 'react';
import ProjectHeader from "@/components/workspace/project/project-header";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import { Separator } from "@/components/ui/separator";
import ProjectBoardView from "@/components/board/ProjectBoardView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCreateBoardDialog from "@/hooks/use-create-board-dialog";
import { useParams } from 'react-router-dom';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { useQuery } from '@tanstack/react-query';
import { getBoardsQueryFn } from '@/lib/api/index';


const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateBoardDialog();
  
  // Get list of boards for this project
  const { data: boardsData } = useQuery({
    queryKey: ['boards', workspaceId, projectId],
    queryFn: () => getBoardsQueryFn({ 
      workspaceId: workspaceId as string,
      projectId: projectId as string
    }),
    enabled: !!workspaceId && !!projectId
  });
  
  const boards = boardsData?.boards || [];

  // When no boards exist, automatically open the dialog to create one
  useEffect(() => {
    if (boardsData && boards.length === 0) {
      // Optional: Uncomment to auto-open the dialog for first-time users
      // onOpen();
    }
  }, [boardsData, boards.length, onOpen]);
  
  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <ProjectHeader />
      <ProjectAnalytics />
      <Separator className="my-6" />
      
      <Tabs defaultValue="board" className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent px-0 mb-4">
          <TabsTrigger 
            className="data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-4 rounded-none border-b-2 border-transparent" 
            value="board"
          >
            Board
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-4 rounded-none border-b-2 border-transparent" 
            value="tasks"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            className="data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-4 rounded-none border-b-2 border-transparent" 
            value="docs"
          >
            Docs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="board" className="h-full">
          <ProjectBoardView />
        </TabsContent>
        
        <TabsContent value="tasks">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Task list view coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="docs">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Documentation view coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ProjectDetails;
