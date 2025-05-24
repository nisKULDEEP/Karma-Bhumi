import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCustomStatuses } from '../../hooks/useCustomStatuses';
import { Button } from '../ui/Button';
import { PlusCircle, Settings, Trash2 } from 'lucide-react';
import CustomStatusDialog from './CustomStatusDialog';
import { CustomStatus } from '../../types/task.type';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
// import { AlertDialog } from '../ui/alert-dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const CustomStatusManager = () => {
  const { workspaceId = '', projectId = '' } = useParams<{ workspaceId: string; projectId: string }>();
  const { 
    customStatuses, 
    loading, 
    addCustomStatus,
    editCustomStatus,
    removeCustomStatus,
  } = useCustomStatuses(workspaceId, projectId);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<CustomStatus | null>(null);
  
  const handleOpenEditDialog = (status: CustomStatus) => {
    setCurrentStatus(status);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (status: CustomStatus) => {
    setCurrentStatus(status);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditStatus = async (name: string, color: string) => {
    if (!currentStatus) return false;
    
    return await editCustomStatus(currentStatus.id, { name, color });
  };
  
  const handleDeleteStatus = async () => {
    if (!currentStatus) return;
    
    await removeCustomStatus(currentStatus.id);
    setIsDeleteDialogOpen(false);
    setCurrentStatus(null);
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">Custom Statuses</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={loading}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Status
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {customStatuses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No custom statuses yet. Create one to organize your tasks.
          </p>
        ) : (
          customStatuses.map((status) => (
            <div 
              key={status.id} 
              className="flex items-center rounded-md border pl-2 pr-1 py-1"
            >
              <span
                className="h-3 w-3 rounded-full mr-2"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-sm mr-1">{status.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenEditDialog(status)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleOpenDeleteDialog(status)}
                    className="text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
      
      {/* Create custom status dialog */}
      <CustomStatusDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addCustomStatus}
        title="Create Custom Status"
      />
      
      {/* Edit custom status dialog */}
      <CustomStatusDialog 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentStatus(null);
        }}
        onSave={handleEditStatus}
        editingStatus={currentStatus || undefined}
        title="Edit Custom Status"
      />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{currentStatus?.name}" status? 
              This will not delete tasks using this status, but they may need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCurrentStatus(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStatus}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomStatusManager;