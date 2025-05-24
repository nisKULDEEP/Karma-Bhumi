import React from 'react';
import { getListViewTasksQueryFn } from '@/lib/api/index';
import { useQuery } from '@tanstack/react-query';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import { TaskType } from '@/types/api.type';
import useTaskDetailsDialog from '@/hooks/use-task-details-dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { TaskPriorityEnum, TaskStatusEnum } from '@/constant';
import { transformStatusEnum } from '@/lib/helper';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';

interface ListViewProps {
  projectId?: string;
}

const ListView = ({ projectId }: ListViewProps) => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useTaskDetailsDialog();

  const { data, isLoading } = useQuery({
    queryKey: ["list-view-tasks", workspaceId, projectId],
    queryFn: () => getListViewTasksQueryFn({
      workspaceId,
      pageSize: 100,
    }),
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No tasks found. Create a new task to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const name = task?.assignedTo?.name || "Unassigned";
            const initials = getAvatarFallbackText(name);
            const avatarColor = getAvatarColor(name);
            
            return (
              <TableRow 
                key={task._id} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onOpen(task._id)}
              >
                <TableCell className="text-xs font-medium text-gray-500">
                  {task.taskCode}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {task.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={TaskStatusEnum[task.status]}
                    className="text-xs px-2 py-0.5 uppercase"
                  >
                    {transformStatusEnum(task.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={TaskPriorityEnum[task.priority]}
                    className="text-xs px-2 py-0.5 uppercase"
                  >
                    {transformStatusEnum(task.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.dueDate 
                    ? format(new Date(task.dueDate), "MMM d, yyyy") 
                    : "No due date"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={name} />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ListView;