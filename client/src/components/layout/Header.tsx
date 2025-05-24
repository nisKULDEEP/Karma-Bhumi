import React from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onNewTask?: () => void;
  onNewProject?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewTask, onNewProject }) => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-white">
      {/* Page title will go in the page component */}
      <div></div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex"
          onClick={onNewTask}
        >
          New Task
        </Button>
        
        <Button 
          size="sm" 
          className="hidden sm:flex"
          onClick={onNewProject}
        >
          New Project
        </Button>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 text-sm hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">Task assigned to you</div>
                <div className="text-gray-500 text-xs">2 minutes ago</div>
              </div>
              <div className="p-2 text-sm hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">New comment on task</div>
                <div className="text-gray-500 text-xs">1 hour ago</div>
              </div>
              <div className="p-2 text-sm hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">Project status update</div>
                <div className="text-gray-500 text-xs">Yesterday</div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Help</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;