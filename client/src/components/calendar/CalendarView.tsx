import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';

interface CalendarViewProps {
  workspaceId: string;
}

// Event types and colors configuration
const EVENT_TYPES = {
  task: { label: 'Task', icon: 'task' },
  sprint: { label: 'Sprint', icon: 'sprint' },
  deadline: { label: 'Deadline', icon: 'deadline' }
};

export const CalendarView: React.FC<CalendarViewProps> = ({ workspaceId }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Load calendar events when calendar date range changes
  const handleDateSet = (dateInfo: any) => {
    loadEvents(dateInfo.startStr, dateInfo.endStr);
  };

  // Fetch events from the server
  const loadEvents = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/calendar/workspace/${workspaceId}/events`, {
        params: { startDate, endDate }
      });
      
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        
        // Clear existing events
        calendarApi.removeAllEvents();
        
        // Add new events
        const { events } = response.data;
        events.forEach((event: any) => {
          calendarApi.addEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            backgroundColor: event.color,
            borderColor: event.color,
            extendedProps: event.extendedProps
          });
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: 'Failed to load events',
        description: 'Could not load your calendar events. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // Handle event click to show details
  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsEventDetailsOpen(true);
  };

  // Handle event drag to update dates
  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const { extendedProps } = event;
    
    // Only allow moving tasks, not sprints or deadlines
    if (extendedProps.type !== 'task') {
      info.revert();
      toast({
        title: 'Cannot move this item',
        description: `${extendedProps.type === 'sprint' ? 'Sprints' : 'Deadlines'} cannot be moved directly from the calendar.`,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await axios.patch(`/calendar/workspace/${workspaceId}/task/dates`, {
        taskId: extendedProps.taskId,
        startDate: event.start.toISOString(),
        endDate: event.end ? event.end.toISOString() : event.start.toISOString()
      });
      
      toast({
        title: 'Task updated',
        description: 'Task dates have been updated successfully.'
      });
    } catch (error) {
      console.error('Error updating task dates:', error);
      info.revert();
      toast({
        title: 'Update failed',
        description: 'Failed to update task dates. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Format event type for display
  const formatEventType = (type: string) => {
    switch (type) {
      case 'task': return 'Task';
      case 'sprint': return 'Sprint';
      case 'deadline': return 'Deadline';
      default: return type;
    }
  };

  const getEventStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      'To Do': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      'Review': 'bg-amber-100 text-amber-800',
      'Done': 'bg-green-100 text-green-800',
      'Backlog': 'bg-gray-100 text-gray-800',
      'Blocked': 'bg-red-100 text-red-800'
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={colorClass} variant="outline">
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Select 
                defaultValue="dayGridMonth" 
                value={calendarView} 
                onValueChange={(value: any) => setCalendarView(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                  <SelectItem value="timeGridDay">Day</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    loadEvents(
                      calendarApi.view.activeStart.toISOString(),
                      calendarApi.view.activeEnd.toISOString()
                    );
                  }
                }}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-background/50 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          <div className="h-[calc(100vh-240px)]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              datesSet={handleDateSet}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Sheet */}
      <Sheet open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedEvent?.title}</SheetTitle>
            <SheetDescription>
              <Badge className="mt-2">
                {selectedEvent?.extendedProps?.type && formatEventType(selectedEvent.extendedProps.type)}
              </Badge>
              {selectedEvent?.extendedProps?.status && getEventStatusBadge(selectedEvent.extendedProps.status)}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No start date'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                  {selectedEvent?.end ? ` - ${new Date(selectedEvent.end).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}` : ''}
                </div>
              </div>
              
              {selectedEvent?.extendedProps?.assignee && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    Assigned to: {selectedEvent.extendedProps.assignee.name}
                  </div>
                </div>
              )}
              
              {selectedEvent?.extendedProps?.type === 'task' && selectedEvent?.extendedProps?.priority && (
                <div className="mt-4">
                  <span className="text-sm font-medium">Priority: </span>
                  <Badge variant={selectedEvent.extendedProps.priority === 'High' ? 'destructive' : (
                    selectedEvent.extendedProps.priority === 'Medium' ? 'default' : 'outline'
                  )}>
                    {selectedEvent.extendedProps.priority}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <SheetFooter>
            {selectedEvent?.extendedProps?.type === 'task' && selectedEvent?.extendedProps?.taskId && (
              <Button 
                onClick={() => {
                  // Handle navigation to task detail page
                  const projectId = selectedEvent.extendedProps.projectId;
                  const taskId = selectedEvent.extendedProps.taskId;
                  
                  // Close the sheet and navigate
                  setIsEventDetailsOpen(false);
                  // This would typically use a router, but for simplicity we'll use window.location
                  window.location.href = `/workspace/${workspaceId}/project/${projectId}/task/${taskId}`;
                }}
              >
                View Task Details
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};