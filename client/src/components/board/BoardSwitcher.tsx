import React from 'react';
import { 
  LayoutKanban,
  ListTodo,
  GanttChart
} from 'lucide-react';
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from '@/components/ui/toggle-group';
import { BoardType } from '@/types/task.types';

interface BoardSwitcherProps {
  currentView: BoardType;
  onViewChange: (view: BoardType) => void;
}

export const BoardSwitcher: React.FC<BoardSwitcherProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <ToggleGroup type="single" value={currentView} onValueChange={(value) => value && onViewChange(value as BoardType)}>
      <ToggleGroupItem value={BoardType.KANBAN} aria-label="Kanban view">
        <LayoutKanban className="h-5 w-5 mr-2" />
        Kanban
      </ToggleGroupItem>
      <ToggleGroupItem value={BoardType.LIST} aria-label="List view">
        <ListTodo className="h-5 w-5 mr-2" />
        List
      </ToggleGroupItem>
      <ToggleGroupItem value={BoardType.GANTT} aria-label="Gantt view">
        <GanttChart className="h-5 w-5 mr-2" />
        Gantt
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default BoardSwitcher;