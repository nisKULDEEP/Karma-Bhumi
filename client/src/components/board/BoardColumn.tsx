import { TaskStatusEnum } from "@/constant";
import { TaskType } from "@/types/api.type";
import { transformStatusEnum } from "@/lib/helper";
import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import AddTaskButton from "./AddTaskButton";
import useTaskDetailsDialog from "@/hooks/use-task-details-dialog";
import useCreateTaskDialog from "@/hooks/use-create-task-dialog";

interface BoardColumnProps {
  columnId: TaskStatusEnum;
  tasks: TaskType[];
  projectId: string;
}

const BoardColumn = ({ columnId, tasks, projectId }: BoardColumnProps) => {
  const { onOpen } = useTaskDetailsDialog();
  const { onOpenWithStatus } = useCreateTaskDialog();
  
  return (
    <div className="flex flex-col w-72 min-w-[288px] bg-gray-50 dark:bg-zinc-900/50 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm uppercase text-gray-700 dark:text-gray-300">
          {transformStatusEnum(columnId)}
          <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">({tasks.length})</span>
        </h3>
        <AddTaskButton onClick={() => onOpenWithStatus(columnId)} />
      </div>
      
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 min-h-[200px]"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onOpen(task._id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default BoardColumn;