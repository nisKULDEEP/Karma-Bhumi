import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart } from '@/components/gantt/GanttChart';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import { TimeEntryList } from '@/components/time-tracking/TimeEntryList';
import { TimeReportSummary } from '@/components/time-tracking/TimeReportSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'react-router-dom';

export const ProjectManagementView = () => {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const [activeTab, setActiveTab] = useState('timeline');
  const [refreshTimeEntries, setRefreshTimeEntries] = useState(0);

  // Trigger refresh of time entries when timer is started/stopped
  const handleTimerUpdate = () => {
    setRefreshTimeEntries(prev => prev + 1);
  };

  if (!workspaceId || !projectId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invalid Project</h2>
          <p className="text-muted-foreground">Workspace or project ID is missing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side: Time Tracker */}
        <div className="w-full md:w-1/3">
          <TimeTracker 
            workspaceId={workspaceId} 
            projectId={projectId}
            onTimerUpdate={handleTimerUpdate}
          />
        </div>
        
        {/* Right side: Main content area with tabs */}
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="time-tracking">Time Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="mt-4">
              <GanttChart workspaceId={workspaceId} projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-4">
              <CalendarView workspaceId={workspaceId} />
            </TabsContent>
            
            <TabsContent value="time-tracking" className="mt-4 space-y-6">
              <TimeReportSummary workspaceId={workspaceId} projectId={projectId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {/* Time Entries List */}
      <div className="w-full">
        <TimeEntryList 
          workspaceId={workspaceId} 
          projectId={projectId}
          refreshTrigger={refreshTimeEntries}
        />
      </div>
    </div>
  );
};