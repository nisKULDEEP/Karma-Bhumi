import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn, updateTaskStatusMutationFn } from "@/lib/api/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BoardColumn from "./BoardColumn";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import CreateTaskDialog from "../workspace/task/create-task-dialog";
import TaskDetailsDialog from "../workspace/task/task-details-dialog";

const BoardView = () => {
  const { projectId } = useParams();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["board-tasks", workspaceId, projectId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        projectId: projectId || "",
        pageSize: 1000, // Get all tasks for the board view
      }),
    enabled: !!workspaceId,
  });

  const { mutate: updateTaskStatus, isPending: isUpdating } = useMutation({
    mutationFn: updateTaskStatusMutationFn,
  });

  const [tasksByStatus, setTasksByStatus] = useState<Record<string, TaskType[]>>({});

  useEffect(() => {
    if (data?.tasks) {
      // Group tasks by status
      const groupedTasks = data.tasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(task);
        return acc;
      }, {} as Record<string, TaskType[]>);
      
      // Ensure all status columns exist, even if empty
      Object.values(TaskStatusEnum).forEach((status) => {
        if (!groupedTasks[status]) {
          groupedTasks[status] = [];
        }
      });

      setTasksByStatus(groupedTasks);
    }
  }, [data]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the task was dropped in the same place, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as TaskStatusEnum;
    
    // Optimistically update the UI
    const sourceStatus = source.droppableId;
    const taskToMove = tasksByStatus[sourceStatus].find(task => task._id === taskId);
    
    if (!taskToMove) return;
    
    // Create a copy of the current state
    const newTasksByStatus = { ...tasksByStatus };
    
    // Remove task from source column
    newTasksByStatus[sourceStatus] = newTasksByStatus[sourceStatus].filter(
      task => task._id !== taskId
    );
    
    // Add task to destination column with updated status
    const updatedTask = { ...taskToMove, status: newStatus };
    newTasksByStatus[newStatus] = [...newTasksByStatus[newStatus], updatedTask];
    
    // Update state
    setTasksByStatus(newTasksByStatus);
    
    // Make API call to update the task status
    updateTaskStatus(
      { workspaceId, taskId, status: newStatus },
      {
        onSuccess: () => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["board-tasks", workspaceId, projectId],
          });
          
          toast({
            title: "Task updated",
            description: "Task status updated successfully",
            variant: "success",
          });
        },
        onError: (error) => {
          // Revert to previous state on error
          setTasksByStatus(tasksByStatus);
          
          toast({
            title: "Error",
            description: error.message || "Failed to update task status",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Board View</h2>
        <CreateTaskDialog projectId={projectId} />
      </div>

      <div className="overflow-x-auto pb-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {Object.entries(tasksByStatus)
              .sort(([a], [b]) => {
                // Custom sort order for columns
                const order = [
                  TaskStatusEnum.BACKLOG,
                  TaskStatusEnum.TODO, 
                  TaskStatusEnum.IN_PROGRESS, 
                  TaskStatusEnum.IN_REVIEW, 
                  TaskStatusEnum.DONE
                ];
                return order.indexOf(a as TaskStatusEnum) - order.indexOf(b as TaskStatusEnum);
              })
              .map(([status, tasks]) => (
                <BoardColumn
                  key={status}
                  columnId={status as TaskStatusEnum}
                  tasks={tasks}
                  projectId={projectId}
                />
              ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task details dialog */}
      <TaskDetailsDialog />
    </div>
  );
};

export default BoardView;