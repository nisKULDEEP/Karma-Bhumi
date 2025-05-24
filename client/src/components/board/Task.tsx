import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import { Permissions } from '@/constant';
// Fix the import by using the named export exactly as defined in the file
import { useAuth } from '@/context/auth-provider';
import useEditTaskDialog from '@/hooks/use-edit-task-dialog';
import useDeleteTaskDialog from '@/hooks/use-delete-task-dialog';

interface TaskProps {
  task: any;
  index: number;
}

const Task = ({ task, index }: TaskProps) => {
  const { projectId } = useParams();
  const workspaceId = useWorkspaceId();
  const navigate = useNavigate();
  // Update the variable name to match the hook we're using
  const { hasPermission } = useAuth();
  const { onOpen: onOpenEditDialog } = useEditTaskDialog();
  const { onOpen: onOpenDeleteDialog } = useDeleteTaskDialog();

  const canEditTask = hasPermission(Permissions.EDIT_TASK);
  const canDeleteTask = hasPermission(Permissions.DELETE_TASK);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTaskClick = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/task/${task._id}`);
  };

  const getFlagColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return '';
    }
  };

  const flagColor = getFlagColor(task.priority);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-md border border-gray-200 shadow-sm p-3 mb-3 ${
            snapshot.isDragging ? 'opacity-70' : ''
          }`}
          onClick={handleTaskClick}
        >
          <div className="text-xs text-gray-500 mb-1">
            {task.project?.name || 'Project'} &gt; {task.status}
          </div>
          
          <h4 className="font-medium mb-2 text-sm">{task.title}</h4>
          
          {task.description && (
            <div className="text-xs text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div>
              {task.assignedTo && (
                <Avatar 
                  className="w-6 h-6" 
                  title={task.assignedTo.name}
                >
                  <AvatarImage src={task.assignedTo.profilePicture || ''} />
                  <AvatarFallback 
                    className={`text-xs ${getAvatarColor(task.assignedTo.name)}`}
                  >
                    {getAvatarFallbackText(task.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {task.comments?.length > 0 && (
                <span className="flex items-center text-xs text-gray-500">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  {task.comments.length}
                </span>
              )}
              
              {task.attachments?.length > 0 && (
                <span className="flex items-center text-xs text-gray-500">
                  <Paperclip className="w-3.5 h-3.5 mr-1" />
                  {task.attachments.length}
                </span>
              )}
              
              {flagColor && (
                <div className={`w-3 h-3 rounded-sm ${flagColor}`} />
              )}
              
              <DropdownMenu 
                open={isMenuOpen} 
                onOpenChange={setIsMenuOpen}
              >
                <DropdownMenuTrigger 
                  className="ml-2 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditDialog(task);
                  }} disabled={!canEditTask}>
                    Edit Task
                  </DropdownMenuItem>
                  
                  {canDeleteTask && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeleteDialog(task);
                        }}
                      >
                        Delete Task
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;