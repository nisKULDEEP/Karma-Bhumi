import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Filter, 
  Download, 
  LayoutKanban, 
  ListTodo, 
  GanttChart,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { BoardType } from '@/hooks/use-create-board-dialog';

interface BoardHeaderProps {
  boardId: string;
  boardName: string;
  projectId: string;
  boardType: BoardType;
  onChangeBoardType: (type: BoardType) => void;
  onRenameBoard: (name: string) => void;
  onDeleteBoard: () => void;
}

export const BoardHeader = ({
  boardId,
  boardName,
  projectId,
  boardType,
  onChangeBoardType,
  onRenameBoard,
  onDeleteBoard,
}: BoardHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBoardName, setNewBoardName] = useState(boardName);
  const queryClient = useQueryClient();

  const handleRename = () => {
    if (newBoardName.trim() && newBoardName !== boardName) {
      onRenameBoard(newBoardName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewBoardName(boardName);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b">
      <div className="flex items-center space-x-2">
        {isEditing ? (
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="font-semibold text-lg w-64"
            autoFocus
          />
        ) : (
          <>
            <h1 className="font-semibold text-lg">{boardName}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {/* Board Type Switcher */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={boardType === BoardType.KANBAN ? "default" : "outline"}
                size="sm"
                onClick={() => onChangeBoardType(BoardType.KANBAN)}
                className="h-8"
              >
                <LayoutKanban className="h-4 w-4 mr-1" />
                Kanban
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to Kanban view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={boardType === BoardType.LIST ? "default" : "outline"}
                size="sm"
                onClick={() => onChangeBoardType(BoardType.LIST)}
                className="h-8"
              >
                <ListTodo className="h-4 w-4 mr-1" />
                List
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to List view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={boardType === BoardType.GANTT ? "default" : "outline"}
                size="sm"
                onClick={() => onChangeBoardType(BoardType.GANTT)}
                className="h-8"
              >
                <GanttChart className="h-4 w-4 mr-1" />
                Gantt
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Switch to Gantt view</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Filter Tasks Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filter tasks</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Team Members Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Users className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Team members</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename Board
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Board
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDeleteBoard}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BoardHeader;