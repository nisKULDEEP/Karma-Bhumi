import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon, PlusIcon, X, Edit } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskPriorityEnum, TaskStatusEnum, Epic, Task, User } from '@/types/task.types';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

// Define custom field structure
interface CustomField {
  key: string;
  value: string;
}

// Temporary MultiSelect component 
const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder,
  disabled = false
}: { 
  options: {label: string, value: string}[], 
  selected: string[], 
  onChange: (selected: string[]) => void, 
  placeholder: string,
  disabled?: boolean
}) => {
  return (
    <div className="border rounded-md p-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.map(value => {
          const option = options.find(opt => opt.value === value);
          return option ? (
            <div key={value} className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm flex items-center">
              {option.label}
              {!disabled && (
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => onChange(selected.filter(s => s !== value))}
                />
              )}
            </div>
          ) : null;
        })}
      </div>
      {!disabled && (
        <Select
          onValueChange={(value) => {
            if (!selected.includes(value)) {
              onChange([...selected, value]);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter(option => !selected.includes(option.value))
              .map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
  taskId: string;
  projectId: string;
  workspaceId: string;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  open,
  onClose,
  onTaskUpdated,
  taskId,
  projectId,
  workspaceId
}) => {
  const { toast } = useToast();
  
  // View state
  const [isEditMode, setIsEditMode] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Form state
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatusEnum>(TaskStatusEnum.TODO);
  const [priority, setPriority] = useState<TaskPriorityEnum>(TaskPriorityEnum.MEDIUM);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [epic, setEpic] = useState<string | undefined>(undefined);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Data for selects
  const [users, setUsers] = useState<User[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch task details, available users and epics
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch task details
        const taskResponse = await axios.get(`/api/tasks/${taskId}/project/${projectId}/workspace/${workspaceId}`);
        const taskData = taskResponse.data.task;
        setTask(taskData);
        
        // Set form data from task
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setStatus(taskData.status);
        setPriority(taskData.priority);
        setAssignees(taskData.assignedTo?.map((user: User) => user._id) || []);
        setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
        setStartDate(taskData.startDate ? new Date(taskData.startDate) : undefined);
        setEpic(taskData.epic?._id);
        setCustomFields(taskData.customFields || []);
        
        // Fetch comments
        const commentsResponse = await axios.get(`/api/tasks/${taskId}/comments/project/${projectId}/workspace/${workspaceId}`);
        setComments(commentsResponse.data.comments);
        
        // Fetch workspace members
        const membersResponse = await axios.get(`/api/members/workspace/${workspaceId}`);
        setUsers(membersResponse.data.members.map((member: { user: User }) => member.user));
        
        // Fetch epics for the project
        const epicsResponse = await axios.get(`/api/epics/workspace/${workspaceId}/project/${projectId}`);
        setEpics(epicsResponse.data.epics);
      } catch (error) {
        console.error('Error fetching task data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load task details.',
          variant: 'destructive',
        });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    
    if (open && taskId) {
      fetchData();
    }
  }, [open, taskId, projectId, workspaceId, toast, onClose]);
  
  // Handle custom field changes
  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };
  
  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };
  
  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };
  
  // Handle form submission for task update
  const handleUpdateTask = async () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        title,
        description,
        status,
        priority,
        assignedTo: assignees,
        dueDate: dueDate ? dueDate.toISOString() : null,
        startDate: startDate ? startDate.toISOString() : null,
        epic,
        customFields: customFields.filter(field => field.key.trim()),
      };
      
      const response = await axios.put(
        `/api/tasks/${taskId}/project/${projectId}/workspace/${workspaceId}`,
        taskData
      );
      
      setTask(response.data.task);
      onTaskUpdated(response.data.task);
      setIsEditMode(false);
      
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await axios.post(
        `/api/tasks/${taskId}/comments/project/${projectId}/workspace/${workspaceId}`,
        { content: newComment }
      );
      
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>
            {isEditMode ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold"
              />
            ) : (
              <span className="text-xl">{title}</span>
            )}
          </DialogTitle>
          <div>
            {isEditMode ? (
              <Button onClick={() => setIsEditMode(false)} variant="outline" size="sm" className="mr-2">
                Cancel
              </Button>
            ) : (
              <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="col-span-2 space-y-4">
            {/* Description */}
            <div>
              <Label>Description</Label>
              {isEditMode ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  rows={5}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-2 border rounded-md min-h-[100px] bg-gray-50">
                  {description || "No description provided."}
                </div>
              )}
            </div>
            
            {/* Comments */}
            <div>
              <Label>Comments</Label>
              <div className="space-y-3 mt-2">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-500">No comments yet.</p>
                )}
                
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2 p-2 border rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.profilePicture} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                <div className="flex space-x-2 mt-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="self-end"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Status */}
            <div>
              <Label>Status</Label>
              {isEditMode ? (
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatusEnum)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatusEnum).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {status.replace('_', ' ')}
                </div>
              )}
            </div>
            
            {/* Priority */}
            <div>
              <Label>Priority</Label>
              {isEditMode ? (
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriorityEnum)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskPriorityEnum).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {priority}
                </div>
              )}
            </div>
            
            {/* Assignees */}
            <div>
              <Label>Assignees</Label>
              <div className="mt-1">
                <MultiSelect
                  options={users.map((user) => ({
                    label: user.name,
                    value: user._id,
                  }))}
                  selected={assignees}
                  onChange={setAssignees}
                  placeholder="Select assignees"
                  disabled={!isEditMode}
                />
              </div>
            </div>
            
            {/* Dates */}
            <div>
              <Label>Start Date</Label>
              {isEditMode ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {startDate ? format(startDate, 'PPP') : 'No start date'}
                </div>
              )}
            </div>
            
            <div>
              <Label>Due Date</Label>
              {isEditMode ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {dueDate ? format(dueDate, 'PPP') : 'No due date'}
                </div>
              )}
            </div>
            
            {/* Epic */}
            <div>
              <Label>Epic</Label>
              {isEditMode ? (
                <Select value={epic} onValueChange={setEpic}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select epic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {epics.map((epic) => (
                      <SelectItem key={epic._id} value={epic._id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-gray-50">
                  {epics.find(e => e._id === epic)?.name || 'None'}
                </div>
              )}
            </div>
            
            {/* Custom Fields */}
            <div>
              <div className="flex justify-between items-center">
                <Label>Custom Fields</Label>
                {isEditMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addCustomField}
                    className="flex items-center text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                )}
              </div>
              
              {customFields.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No custom fields.</p>
              )}
              
              {isEditMode ? (
                <div className="space-y-2 mt-1">
                  {customFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Field name"
                        value={field.key}
                        onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Field value"
                        value={field.value}
                        onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  {customFields.map((field, index) => (
                    <div key={index} className="p-2 border rounded-md bg-gray-50">
                      <span className="font-medium">{field.key}:</span> {field.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isEditMode && (
          <DialogFooter>
            <Button onClick={() => setIsEditMode(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;