import { Droppable } from '@hello-pangea/dnd';
import { Skeleton } from '../ui/skeleton';
import Task from './Task';
import AddTaskButton from './AddTaskButton';
import { useAuthContext } from '@/context/auth-provider';
import { Permissions } from '@/constant';

interface ColumnProps {
  id: string;
  title: string;
  tasks: any[];
  isLoading: boolean;
}

const Column = ({ id, title, tasks, isLoading }: ColumnProps) => {
  const { hasPermission } = useAuthContext();
  const canCreateTask = hasPermission(Permissions.CREATE_TASK);

  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-md shadow-sm">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-800">{title}</h3>
            <span className="ml-2 bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {isLoading ? '…' : tasks.length}
            </span>
          </div>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-2 min-h-[200px] max-h-[calc(100vh-220px)] overflow-y-auto"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="mb-3">
                  <Skeleton className="h-28 w-full rounded-md" />
                </div>
              ))
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No tasks in this column
              </div>
            ) : (
              tasks.map((task, index) => (
                <Task key={task._id} task={task} index={index} />
              ))
            )}
            {provided.placeholder}
            
            {canCreateTask && (
              <div className="mt-2">
                <AddTaskButton columnId={id} />
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;