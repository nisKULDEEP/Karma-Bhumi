import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  PlayCircle, 
  CheckCircle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { useSprints } from '../../hooks/useSprints';
import { ISprint } from '../../types/task.type';

interface SprintManagerProps {
  workspaceId: string;
  projectId: string;
}

export default function SprintManager({ workspaceId, projectId }: SprintManagerProps) {
  const { 
    sprints, 
    activeSprint, 
    isLoading, 
    error, 
    createSprint, 
    startSprint, 
    completeSprint, 
    deleteSprint
  } = useSprints(workspaceId, projectId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<ISprint | null>(null);
  
  // Create sprint form state
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setFormError('Start and end dates are required');
      return;
    }

    if (endDate <= startDate) {
      setFormError('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createSprint({
        name,
        goal,
        startDate,
        endDate,
      });
      
      // Reset form and close dialog
      setName('');
      setGoal('');
      setStartDate(new Date());
      setEndDate(undefined);
      setIsCreateDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An error occurred while creating the sprint');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSprint = async () => {
    if (!selectedSprint) return;
    
    try {
      await startSprint(selectedSprint._id);
      setIsStartDialogOpen(false);
      setSelectedSprint(null);
    } catch (err) {
      console.error('Error starting sprint:', err);
      // Handle error notification
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    
    try {
      await completeSprint(activeSprint._id);
      setIsCompleteDialogOpen(false);
    } catch (err) {
      console.error('Error completing sprint:', err);
      // Handle error notification
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Are you sure you want to delete this sprint? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteSprint(sprintId);
    } catch (err) {
      console.error('Error deleting sprint:', err);
      // Handle error notification
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sprints</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Sprint
        </Button>
      </div>

      {/* Active Sprint Card */}
      {activeSprint ? (
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-2">
                  Active Sprint
                </Badge>
                <CardTitle>{activeSprint.name}</CardTitle>
                {activeSprint.goal && (
                  <CardDescription>{activeSprint.goal}</CardDescription>
                )}
              </div>
              <Button 
                variant="outline" 
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                onClick={() => setIsCompleteDialogOpen(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Complete Sprint
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {format(new Date(activeSprint.startDate), 'MMM d, yyyy')} - {format(new Date(activeSprint.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            {/* Add other sprint details here as needed */}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50 dark:bg-slate-800 border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              No active sprint. Start a sprint to begin tracking progress.
            </p>
            {sprints.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSprint(sprints[0]);
                  setIsStartDialogOpen(true);
                }}
              >
                <PlayCircle className="h-4 w-4 mr-2" /> Start a Sprint
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sprint list */}
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Future Sprints</h3>
        
        {sprints.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">
            No sprints created yet. Create your first sprint to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprints
              .filter(sprint => !sprint.isActive)
              .map(sprint => (
                <Card key={sprint._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{sprint.name}</CardTitle>
                    {sprint.goal && (
                      <CardDescription className="line-clamp-2">{sprint.goal}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(sprint.startDate), 'MMM d, yyyy')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      onClick={() => handleDeleteSprint(sprint._id)}
                    >
                      Delete
                    </Button>
                    {!activeSprint && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setIsStartDialogOpen(true);
                        }}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" /> Start
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateSprint} className="space-y-4 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sprint 1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Sprint Goal (optional)</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you hope to achieve in this sprint?"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="startDate"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Select start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="endDate"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Select end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => startDate ? date <= startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name || !startDate || !endDate}>
                {isSubmitting ? 'Creating...' : 'Create Sprint'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Start Sprint Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Start Sprint</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to start the sprint "{selectedSprint?.name}"?
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sprint duration: {selectedSprint ? `${format(new Date(selectedSprint.startDate), 'MMM d, yyyy')} - ${format(new Date(selectedSprint.endDate), 'MMM d, yyyy')}` : 'N/A'}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsStartDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStartSprint}>
              <PlayCircle className="h-4 w-4 mr-2" /> Start Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Sprint Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Complete Sprint</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                All incomplete tasks will be moved back to the Backlog.
              </AlertDescription>
            </Alert>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to complete the current sprint?
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSprint}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Complete Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}