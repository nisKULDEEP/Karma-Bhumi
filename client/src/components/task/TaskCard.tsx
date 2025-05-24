import React from 'react';
import { Card, Avatar, Badge, Tooltip, AvatarGroup } from '@/components/ui';
import { TaskPriorityEnum, TaskStatusEnum } from '@/types/task.types';
import { CalendarIcon, ChevronRightIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Priority badge colors
const priorityColors = {
  [TaskPriorityEnum.LOWEST]: 'bg-gray-200 text-gray-700',
  [TaskPriorityEnum.LOW]: 'bg-blue-100 text-blue-800',
  [TaskPriorityEnum.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriorityEnum.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriorityEnum.HIGHEST]: 'bg-red-100 text-red-800',
  [TaskPriorityEnum.URGENT]: 'bg-red-500 text-white',
};

// Status badge colors
const statusColors = {
  [TaskStatusEnum.BACKLOG]: 'bg-gray-200 text-gray-700',
  [TaskStatusEnum.TODO]: 'bg-blue-100 text-blue-800',
  [TaskStatusEnum.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TaskStatusEnum.IN_REVIEW]: 'bg-purple-100 text-purple-800',
  [TaskStatusEnum.READY]: 'bg-green-100 text-green-800',
  [TaskStatusEnum.DONE]: 'bg-green-500 text-white',
  [TaskStatusEnum.BLOCKED]: 'bg-red-100 text-red-800',
  [TaskStatusEnum.CANCELLED]: 'bg-gray-500 text-white',
  [TaskStatusEnum.DEFERRED]: 'bg-gray-300 text-gray-700',
};

export interface TaskCardProps {
  id: string;
  taskCode: string;
  title: string;
  description?: string;
  priority: keyof typeof TaskPriorityEnum;
  status: keyof typeof TaskStatusEnum;
  assignees: Array<{
    id: string;
    name: string;
    profilePicture?: string;
  }>;
  dueDate?: Date;
  epic?: {
    id: string;
    name: string;
  };
  hasSubtasks?: boolean;
  subtaskCount?: number;
  onClick?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  taskCode,
  title,
  description,
  priority,
  status,
  assignees,
  dueDate,
  epic,
  hasSubtasks,
  subtaskCount = 0,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card 
      className="p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500 font-mono">{taskCode}</span>
        <div className="flex gap-1">
          <Badge className={priorityColors[priority]}>
            {priority}
          </Badge>
          <Badge className={statusColors[status]}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div>
          {assignees.length > 0 && (
            <AvatarGroup>
              {assignees.map((assignee) => (
                <Tooltip key={assignee.id} content={assignee.name}>
                  <Avatar
                    src={assignee.profilePicture}
                    alt={assignee.name}
                    fallback={assignee.name.substring(0, 2)}
                    className="h-6 w-6"
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {dueDate && (
            <Tooltip content={`Due ${dueDate.toLocaleDateString()}`}>
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDistanceToNow(dueDate, { addSuffix: true })}
              </div>
            </Tooltip>
          )}
          
          {epic && (
            <Tooltip content={`Epic: ${epic.name}`}>
              <Badge variant="outline" className="text-xs">
                {epic.name}
              </Badge>
            </Tooltip>
          )}
          
          {hasSubtasks && (
            <Tooltip content={`${subtaskCount} subtasks`}>
              <Badge variant="secondary" className="text-xs flex items-center">
                {subtaskCount} <ChevronRightIcon className="h-3 w-3 ml-1" />
              </Badge>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;