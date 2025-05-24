import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown, LogOut, Plus, Settings } from 'lucide-react';

interface Workspace {
  _id: string;
  name: string;
  description?: string;
  isCurrentWorkspace: boolean;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

const WorkspaceSwitcher = ({ currentWorkspaceId, onWorkspaceChange }: WorkspaceSwitcherProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/workspace/all');
        
        // Mark the current workspace
        const workspacesWithCurrent = response.data.workspaces.map((workspace: any) => ({
          ...workspace,
          isCurrentWorkspace: workspace._id === currentWorkspaceId
        }));
        
        setWorkspaces(workspacesWithCurrent);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch workspaces:', err);
        setError('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [currentWorkspaceId]);

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) return;
    
    try {
      // First update the current workspace on the server
      await axios.patch('/api/user/current-workspace', { workspaceId });
      
      // Then trigger any parent component updates
      if (onWorkspaceChange) {
        onWorkspaceChange(workspaceId);
      }
      
      // Navigate to the new workspace
      navigate(`/workspace/${workspaceId}`);
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      // Show an error notification here
    }
  };

  const handleCreateWorkspace = () => {
    navigate('/create-workspace');
  };

  // Get the current workspace name
  const currentWorkspace = workspaces.find(w => w.isCurrentWorkspace) || workspaces[0];
  
  if (loading) {
    return (
      <div className="flex items-center h-10 px-4 border rounded-md animate-pulse bg-gray-100 dark:bg-gray-800 w-48">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading workspaces
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex justify-between items-center w-48">
          <div className="flex items-center">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {currentWorkspace?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Your Workspaces
          </p>
          <div className="max-h-60 overflow-auto space-y-1">
            {workspaces.map(workspace => (
              <DropdownMenuItem 
                key={workspace._id}
                className={`cursor-pointer ${workspace.isCurrentWorkspace ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                onClick={() => handleWorkspaceSwitch(workspace._id)}
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {workspace.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-grow truncate">{workspace.name}</span>
                {workspace.isCurrentWorkspace && (
                  <div className="h-2 w-2 bg-green-500 rounded-full ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
          <DropdownMenuItem onClick={handleCreateWorkspace}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Create New Workspace</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings/workspaces')}>
            <Settings className="h-4 w-4 mr-2" />
            <span>Manage Workspaces</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceSwitcher;