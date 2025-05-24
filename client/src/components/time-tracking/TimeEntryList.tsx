import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TimeEntry } from "@/types/time-tracking.type";
import { formatTimeFromSeconds } from "@/lib/time-utils";
import { format } from "date-fns";
import { Edit2Icon, Trash2Icon, PlayIcon } from "lucide-react";
import useTimeEntryMutations from "@/hooks/api/use-time-entry-mutations";
import { useToast } from "@/components/ui/use-toast";
import useGetTimeEntriesQuery from "@/hooks/api/use-get-time-entries";

interface TimeEntryListProps {
  workspaceId: string;
  projectId?: string;
  onRestartTimer?: (entry: TimeEntry) => void;
}

const TimeEntryList = ({ workspaceId, projectId, onRestartTimer }: TimeEntryListProps) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const { deleteTimeEntry } = useTimeEntryMutations(workspaceId);
  const { toast } = useToast();
  
  // Fetch time entries
  const { data, isLoading, error } = useGetTimeEntriesQuery(workspaceId, {
    projectId: projectId || undefined
  });
  
  const timeEntries = data?.timeEntries || [];

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTimeEntry.mutateAsync(id);
      toast({
        title: "Time entry deleted",
        description: "The time entry has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        variant: "destructive",
        title: "Error deleting time entry",
        description: "There was a problem deleting the time entry.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4 text-center p-6">
        <p className="text-muted-foreground">Loading time entries...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 text-center p-6">
        <p className="text-muted-foreground">Failed to load time entries</p>
      </Card>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <Card className="mt-4 text-center p-6">
        <p className="text-muted-foreground">No time entries found</p>
      </Card>
    );
  }

  // Group entries by date
  const entriesByDate: Record<string, TimeEntry[]> = {};
  
  timeEntries.forEach(entry => {
    const date = new Date(entry.startTime).toLocaleDateString();
    if (!entriesByDate[date]) {
      entriesByDate[date] = [];
    }
    entriesByDate[date].push(entry);
  });

  return (
    <div className="space-y-6">
      {Object.entries(entriesByDate).map(([date, entries]) => (
        <Card key={date} className="overflow-hidden">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-medium">
              {new Date(date).toDateString() === new Date().toDateString() 
                ? "Today" 
                : format(new Date(date), "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {entries.map(entry => (
                <div 
                  key={entry._id} 
                  className="p-4 hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(entry._id)}
                >
                  <div className="flex items-center justify-between cursor-pointer">
                    <div>
                      <h3 className="font-medium">{entry.title}</h3>
                      {expandedEntries.has(entry._id) && entry.description && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {entry.projectId && <span>Project: {entry.projectName}</span>}
                        {entry.taskId && <span>• Task: {entry.taskName}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.startTime), "h:mm a")} - {format(new Date(entry.endTime), "h:mm a")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {formatTimeFromSeconds(entry.duration)}
                      </span>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestartTimer?.(entry);
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit functionality would be implemented here
                          }}
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry._id);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TimeEntryList;