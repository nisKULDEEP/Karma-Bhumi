import { Dialog, DialogContent } from "@/components/ui/dialog";
import useTaskDetailsDialog from "@/hooks/use-task-details-dialog";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getTaskByIdQueryFn } from "@/lib/api/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "lucide-react";
import { format } from "date-fns";
import { TaskPriorityEnum, TaskStatusEnum } from "@/types/task.types";
import { getAvatarColor, getAvatarFallbackText, transformStatusEnum } from "@/lib/helper";

const TaskDetailsDialog = () => {
  const { open, taskId, onClose } = useTaskDetailsDialog();
  const workspaceId = useWorkspaceId();

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["task-details", taskId],
    queryFn: () => getTaskByIdQueryFn({ workspaceId, taskId }),
    enabled: !!taskId && !!workspaceId && open,
  });

  const task = taskData?.task;

  return (
    <Dialog modal={true} open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !task ? (
          <div className="text-center py-10">Task not found</div>
        ) : (
          <div className="space-y-4">
            {/* Task Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-1">{task.taskCode}</div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={TaskPriorityEnum[task.priority]}
                  className="px-2 py-0.5 uppercase"
                >
                  {transformStatusEnum(task.priority)}
                </Badge>
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className="px-2 py-0.5 uppercase"
                >
                  {transformStatusEnum(task.status)}
                </Badge>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {/* Due Date */}
              <div>
                <div className="text-sm font-medium text-gray-500">Due Date</div>
                <div className="mt-1">
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "No due date"}
                </div>
              </div>
              
              {/* Project */}
              <div>
                <div className="text-sm font-medium text-gray-500">Project</div>
                <div className="mt-1 flex items-center gap-1">
                  <span>{task.project?.emoji || "📁"}</span>
                  <span>{task.project?.name || "Unknown Project"}</span>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <div className="text-sm font-medium text-gray-500">Assigned To</div>
                {task.assignedTo ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={task.assignedTo?.name} />
                      <AvatarFallback className={getAvatarColor(task.assignedTo?.name)}>
                        {getAvatarFallbackText(task.assignedTo?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignedTo?.name}</span>
                  </div>
                ) : (
                  <div className="mt-1">Unassigned</div>
                )}
              </div>
              
              {/* Created By */}
              <div>
                <div className="text-sm font-medium text-gray-500">Created By</div>
                {task.createdBy ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.createdBy?.profilePicture || ""} alt={task.createdBy?.name} />
                      <AvatarFallback className={getAvatarColor(task.createdBy?.name)}>
                        {getAvatarFallbackText(task.createdBy?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.createdBy?.name}</span>
                  </div>
                ) : (
                  <div className="mt-1">Unknown</div>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
            
            {/* Timestamps */}
            <div className="pt-4 border-t text-sm text-gray-500">
              <div>Created: {format(new Date(task.createdAt), "PPPp")}</div>
              <div>Updated: {format(new Date(task.updatedAt), "PPPp")}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;