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
import { CalendarIcon, PlusIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskPriorityEnum, TaskStatusEnum, Epic, Task, User } from '@/types/task.types';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// Define custom field structure
interface CustomField {
  key: string;
  value: string;
}

// Temporary MultiSelect component until proper implementation is added
// This should be replaced with a proper multi-select component
const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder 
}: { 
  options: {label: string, value: string}[], 
  selected: string[], 
  onChange: (selected: string[]) => void, 
  placeholder: string 
}) => {
  return (
    <div className="border rounded-md p-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.map(value => {
          const option = options.find(opt => opt.value === value);
          return option ? (
            <div key={value} className="bg-blue-100 text-blue-800 rounded-md px-2 py-1 text-sm flex items-center">
              {option.label}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => onChange(selected.filter(s => s !== value))}
              />
            </div>
          ) : null;
        })}
      </div>
      <Select
        onValueChange={(value) => {
          if (!selected.includes(value)) {
            onChange([...selected, value]);
          }
        }}
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
    </div>
  );
};

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  projectId: string;
  workspaceId: string;
  boardId: string;
  initialStatus: TaskStatusEnum | null;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onTaskCreated,
  projectId,
  workspaceId,
  boardId,
  initialStatus
}) => {
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatusEnum>(initialStatus || TaskStatusEnum.TODO);
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
  
  // Fetch available users and epics
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workspace members
        const membersResponse = await axios.get(`/api/members/workspace/${workspaceId}`);
        setUsers(membersResponse.data.members.map((member: { user: User }) => member.user));
        
        // Fetch epics for the project
        const epicsResponse = await axios.get(`/api/epics/workspace/${workspaceId}/project/${projectId}`);
        setEpics(epicsResponse.data.epics);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users or epics.',
          variant: 'destructive',
        });
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open, projectId, workspaceId, toast]);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setStatus(initialStatus || TaskStatusEnum.TODO);
      setPriority(TaskPriorityEnum.MEDIUM);
      setAssignees([]);
      setDueDate(undefined);
      setStartDate(undefined);
      setEpic(undefined);
      setCustomFields([]);
    }
  }, [open, initialStatus]);
  
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
  
  // Handle form submission
  const handleSubmit = async () => {
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
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        epic,
        board: boardId,
        customFields: customFields.filter(field => field.key.trim() && field.value.trim()),
      };
      
      // These should come from context or props
      const teamId = "YOUR_TEAM_ID"; 
      const organizationId = "YOUR_ORG_ID";
      
      const response = await axios.post(
        `/api/tasks/project/${projectId}/workspace/${workspaceId}/organization/${organizationId}/team/${teamId}/create`,
        taskData
      );
      
      onTaskCreated(response.data.task);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={4}
            />
          </div>
          
          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatusEnum)}>
                <SelectTrigger>
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
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriorityEnum)}>
                <SelectTrigger>
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
            </div>
          </div>
          
          {/* Assignees */}
          <div className="grid gap-2">
            <Label htmlFor="assignees">Assignees</Label>
            <MultiSelect
              options={users.map((user) => ({
                label: user.name,
                value: user._id,
              }))}
              selected={assignees}
              onChange={setAssignees}
              placeholder="Select assignees"
            />
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
            </div>
            
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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
            </div>
          </div>
          
          {/* Epic */}
          <div className="grid gap-2">
            <Label htmlFor="epic">Epic</Label>
            <Select value={epic} onValueChange={setEpic}>
              <SelectTrigger>
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
          </div>
          
          {/* Custom Fields */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Custom Fields</Label>
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
            </div>
            
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;