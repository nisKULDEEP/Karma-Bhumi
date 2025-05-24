import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TaskPriorityEnum } from "@/constant";
import { getAvatarColor, getAvatarFallbackText, transformStatusEnum } from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { format } from "date-fns";

interface TaskCardProps {
  task: TaskType;
  onClick?: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const name = task?.assignedTo?.name || "Unassigned";
  const initials = getAvatarFallbackText(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-zinc-800/90 rounded-md shadow-sm border border-gray-200 dark:border-zinc-700/70 p-3 mb-2 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {task.taskCode}
          </span>
          <Badge
            variant={TaskPriorityEnum[task.priority]}
            className="text-xs px-2 py-0.5 uppercase"
          >
            {transformStatusEnum(task.priority)}
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
        
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {task.description}
          </p>
        )}

        <div className="flex justify-between items-center pt-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No due date"}
          </div>
          
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;