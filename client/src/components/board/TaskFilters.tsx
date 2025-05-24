import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import { TaskPriorityEnum, TaskStatusEnum } from '@/types/task.types';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void;
  assignees?: FilterOption[];
  epics?: FilterOption[];
}

export const TaskFilters = ({
  onFilterChange,
  assignees = [],
  epics = [],
}: TaskFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = [
    { value: TaskStatusEnum.BACKLOG, label: 'Backlog' },
    { value: TaskStatusEnum.TODO, label: 'To Do' },
    { value: TaskStatusEnum.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatusEnum.IN_REVIEW, label: 'In Review' },
    { value: TaskStatusEnum.DONE, label: 'Done' },
  ];

  const priorityOptions = [
    { value: TaskPriorityEnum.LOW, label: 'Low' },
    { value: TaskPriorityEnum.MEDIUM, label: 'Medium' },
    { value: TaskPriorityEnum.HIGH, label: 'High' },
    { value: TaskPriorityEnum.URGENT, label: 'Urgent' },
  ];

  const applyFilters = () => {
    onFilterChange({
      search: searchQuery,
      status: selectedStatus.length > 0 ? selectedStatus : undefined,
      priority: selectedPriority.length > 0 ? selectedPriority : undefined,
      assignees: selectedAssignees.length > 0 ? selectedAssignees : undefined,
      epics: selectedEpics.length > 0 ? selectedEpics : undefined,
    });
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedAssignees([]);
    setSelectedEpics([]);
    onFilterChange({});
    setIsFilterOpen(false);
  };

  const handleStatusChange = (statusId: string) => {
    setSelectedStatus(prev => 
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  const handlePriorityChange = (priorityId: string) => {
    setSelectedPriority(prev => 
      prev.includes(priorityId)
        ? prev.filter(id => id !== priorityId)
        : [...prev, priorityId]
    );
  };

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const handleEpicChange = (epicId: string) => {
    setSelectedEpics(prev => 
      prev.includes(epicId)
        ? prev.filter(id => id !== epicId)
        : [...prev, epicId]
    );
  };

  // Calculate active filter count
  const activeFilterCount = [
    selectedStatus.length > 0,
    selectedPriority.length > 0,
    selectedAssignees.length > 0,
    selectedEpics.length > 0
  ].filter(Boolean).length;

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-4"
        />
      </div>

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center font-normal"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h3 className="font-medium">Filters</h3>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="status">
                <AccordionTrigger className="px-4">Status</AccordionTrigger>
                <AccordionContent className="px-4 pt-0 pb-3">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`status-${status.value}`} 
                        checked={selectedStatus.includes(status.value)}
                        onCheckedChange={() => handleStatusChange(status.value)}
                      />
                      <label 
                        htmlFor={`status-${status.value}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="priority">
                <AccordionTrigger className="px-4">Priority</AccordionTrigger>
                <AccordionContent className="px-4 pt-0 pb-3">
                  {priorityOptions.map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`priority-${priority.value}`} 
                        checked={selectedPriority.includes(priority.value)}
                        onCheckedChange={() => handlePriorityChange(priority.value)}
                      />
                      <label 
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {priority.label}
                      </label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {assignees.length > 0 && (
                <AccordionItem value="assignees">
                  <AccordionTrigger className="px-4">Assignees</AccordionTrigger>
                  <AccordionContent className="px-4 pt-0 pb-3">
                    {assignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`assignee-${assignee.id}`} 
                          checked={selectedAssignees.includes(assignee.id)}
                          onCheckedChange={() => handleAssigneeChange(assignee.id)}
                        />
                        <label 
                          htmlFor={`assignee-${assignee.id}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {assignee.label}
                        </label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {epics.length > 0 && (
                <AccordionItem value="epics">
                  <AccordionTrigger className="px-4">Epics</AccordionTrigger>
                  <AccordionContent className="px-4 pt-0 pb-3">
                    {epics.map((epic) => (
                      <div key={epic.id} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`epic-${epic.id}`} 
                          checked={selectedEpics.includes(epic.id)}
                          onCheckedChange={() => handleEpicChange(epic.id)}
                        />
                        <label 
                          htmlFor={`epic-${epic.id}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          {epic.label}
                        </label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>

          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskFilters;