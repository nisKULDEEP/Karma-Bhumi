import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
// import { TimeReports } from './TimeReports';
import TimeEntryList from './TimeEntryList';
import { 
  Clock, 
  Play, 
  Pause, 
  BarChart4, 
  ListIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useGetWorkspaceProjectsQuery from '@/hooks/api/use-get-workspace-projects';
import useGetProjectTasksQuery from '@/hooks/api/use-get-project-tasks';
import useTimeEntryMutations from '@/hooks/api/use-time-entry-mutations';
import { CreateTimeEntryType } from '@/types/time-tracking.type';
import { TimeReports } from './TimeReports';

interface TimeTrackerProps {
  workspaceId: string;
  projectId?: string;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ 
  workspaceId,
  projectId 
}) => {
  const [activeTab, setActiveTab] = useState('track');
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projectId);
  const [selectedTask, setSelectedTask] = useState<string | undefined>();
  const { toast } = useToast();

  // Use API hooks for data fetching
  const projectsQuery = useGetWorkspaceProjectsQuery(workspaceId);
  const tasksQuery = useGetProjectTasksQuery(selectedProject || '');
  const { createTimeEntry } = useTimeEntryMutations(workspaceId);

  // Update selectedProject when projectId prop changes
  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  // Timer effect for tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTracking && trackingStartTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, trackingStartTime]);

  const handleStartTracking = () => {
    if (!selectedProject) {
      toast({
        title: 'Project required',
        description: 'Please select a project before tracking time',
        variant: 'destructive',
      });
      return;
    }

    setTrackingStartTime(new Date());
    setIsTracking(true);
  };

  const handleStopTracking = async () => {
    if (!isTracking || !trackingStartTime || !selectedProject) return;
    
    setIsTracking(false);
    const endTime = new Date();
    
    try {
      const timeEntryData: CreateTimeEntryType = {
        workspace: workspaceId,
        projectId: selectedProject,
        taskId: selectedTask,
        title: description || 'Time entry',
        description: description || 'No description',
        startTime: trackingStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedTime, // in seconds
        billable: false,
        tags: []
      };
      
      await createTimeEntry.mutateAsync(timeEntryData);
      
      toast({
        title: 'Time entry saved',
        description: `Tracked ${formatTime(elapsedTime)} successfully`,
      });
      
      // Reset tracking state
      setElapsedTime(0);
      setTrackingStartTime(null);
      setDescription('');
      
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: 'Failed to save time entry',
        description: 'Something went wrong while saving the time entry',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <Card className="shadow-sm">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="track">
            <Clock className="h-4 w-4 mr-2" />
            Time Tracker
          </TabsTrigger>
          <TabsTrigger value="entries">
            <ListIcon className="h-4 w-4 mr-2" />
            Time Entries
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart4 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="track" className="p-0">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Project & Task Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    id="project"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Select a project</option>
                    {projectsQuery.data?.projects?.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
                    Task (Optional)
                  </label>
                  <select
                    id="task"
                    disabled={!selectedProject}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={selectedTask || ''}
                    onChange={(e) => setSelectedTask(e.target.value)}
                  >
                    <option value="">Select a task</option>
                    {tasksQuery.data?.tasks?.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  What are you working on?
                </label>
                <input
                  id="description"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Timer Display */}
              <div className="flex items-center justify-center my-4">
                <div className="text-5xl font-mono font-bold">
                  {formatTime(elapsedTime)}
                </div>
              </div>
              
              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                {!isTracking ? (
                  <Button 
                    onClick={handleStartTracking}
                    className="w-36"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopTracking}
                    variant="destructive"
                    className="w-36"
                    size="lg"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="entries">
          <TimeEntryList workspaceId={workspaceId} projectId={selectedProject} />
        </TabsContent>
        
        <TabsContent value="reports">
          <TimeReports workspaceId={workspaceId} projectId={selectedProject} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};