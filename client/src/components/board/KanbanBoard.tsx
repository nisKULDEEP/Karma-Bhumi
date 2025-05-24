import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatusEnum } from '@/types/task.types';
import TaskCard from './TaskCard';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Column configuration with titles and task statuses
const columns = [
  { id: 'backlog', title: 'Backlog', status: TaskStatusEnum.BACKLOG },
  { id: 'todo', title: 'To Do', status: TaskStatusEnum.TODO },
  { id: 'in-progress', title: 'In Progress', status: TaskStatusEnum.IN_PROGRESS },
  { id: 'in-review', title: 'In Review', status: TaskStatusEnum.IN_REVIEW },
  { id: 'done', title: 'Done', status: TaskStatusEnum.DONE },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onCreateTask?: (status: TaskStatusEnum) => void;
  onTaskMove?: (taskId: string, newStatus: TaskStatusEnum) => Promise<void>;
  isLoading?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskClick,
  onCreateTask,
  onTaskMove,
  isLoading = false,
}) => {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});

  // Group tasks by status
  useEffect(() => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter(task => 
        task.status === column.status && !task.isSubtask
      );
      return acc;
    }, {} as Record<string, Task[]>);
    
    setGroupedTasks(grouped);
  }, [tasks]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the task that was dragged
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Get the new status based on the destination column
    const targetColumn = columns.find(col => col.id === destination.droppableId);
    if (!targetColumn) return;

    // Update locally first for a responsive UI
    const sourceColumn = [...(groupedTasks[source.droppableId] || [])];
    const destColumn = [...(groupedTasks[destination.droppableId] || [])];
    
    // Remove from source column
    const [removed] = sourceColumn.splice(source.index, 1);
    
    // Add to destination column
    destColumn.splice(destination.index, 0, removed);
    
    setGroupedTasks({
      ...groupedTasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn
    });

    // Call the API to update the task status
    if (onTaskMove) {
      try {
        await onTaskMove(task._id, targetColumn.status);
      } catch (error) {
        // If the API call fails, revert the UI changes
        console.error('Failed to update task status:', error);
        // Re-fetch tasks or revert the state as needed
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-4 min-h-[calc(100vh-200px)]">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col w-72 min-w-72 bg-gray-50 rounded-md">
            <div className="p-2 font-medium border-b sticky top-0 bg-gray-100 rounded-t-md">
              <div className="flex justify-between items-center">
                <h3>{column.title}</h3>
                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                  {groupedTasks[column.id]?.length || 0}
                </span>
              </div>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 p-2 overflow-y-auto"
                  style={{ minHeight: '100px' }}
                >
                  {groupedTasks[column.id]?.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard
                            id={task._id}
                            taskCode={task.taskCode}
                            title={task.title}
                            description={task.description}
                            priority={task.priority}
                            status={task.status}
                            assignees={task.assignedTo.map(user => ({
                              id: user._id,
                              name: user.name,
                              profilePicture: user.profilePicture
                            }))}
                            dueDate={task.dueDate}
                            epic={task.epic && typeof task.epic !== 'string' ? {
                              id: task.epic._id,
                              name: task.epic.name
                            } : undefined}
                            hasSubtasks={false} // This would be determined by your backend
                            subtaskCount={0}    // This would be determined by your backend
                            onClick={() => onTaskClick && onTaskClick(task._id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-500 hover:text-gray-700"
                onClick={() => onCreateTask && onCreateTask(column.status)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;