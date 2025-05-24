import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import useGetTimeEntriesQuery from '@/hooks/api/use-get-time-entries';
import useGetWorkspaceProjectsQuery from '@/hooks/api/use-get-workspace-projects';
import useGetWorkspaceMembersQuery from '@/hooks/api/use-get-workspace-members';
import { TimeEntry } from '@/types/time-tracking.type';
import { AllMembersInWorkspaceResponseType } from '@/types/api.type';

// Import the DateRangePicker component explicitly with the correct path
import { DateRangePicker } from '@/components/time-tracking/DateRangePicker';

interface TimeReportsProps {
  workspaceId: string;
  projectId?: string;
}

interface Project {
  _id: string;
  name: string;
  color: string;
}

interface User {
  _id: string;
  name: string;
}

interface ProjectTimeSummary {
  [key: string]: {
    name: string;
    value: number;
    id: string;
  }
}

interface DailySummary {
  [date: string]: {
    date: string;
    hours: number;
    formattedDate: string;
  }
}

interface ChartDataPoint {
  date: string;
  hours: number;
  formattedDate: string;
}

interface ProjectChartDataPoint {
  name: string;
  value: number;
  id: string;
}

export const TimeReports: React.FC<TimeReportsProps> = ({ 
  workspaceId, 
  projectId 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProject, setSelectedProject] = useState<string>(projectId || 'all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const { toast } = useToast();
  
  // Update selectedProject when projectId prop changes
  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  // Use API hooks to fetch data
  const timeEntriesQuery = useGetTimeEntriesQuery(workspaceId, {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString()
  });
  
  const projectsQuery = useGetWorkspaceProjectsQuery(workspaceId);
  
  const membersQuery = useGetWorkspaceMembersQuery(workspaceId);
  
  // Check if any query is loading
  const isLoading = timeEntriesQuery.isLoading || projectsQuery.isLoading || membersQuery.isLoading;
  
  // Format workspace members data into users array
  const users = React.useMemo(() => {
    if (!membersQuery.data?.members) return [];
    
    return membersQuery.data.members.map(member => ({
      _id: member.userId._id,
      name: `${member.userId.name}`
    }));
  }, [membersQuery.data]);
  
  // Apply filters to entries
  const filteredEntries = React.useMemo(() => {
    if (!timeEntriesQuery.data?.timeEntries) return [] as TimeEntry[];
    
    return timeEntriesQuery.data.timeEntries.filter(entry => {
      const startDate = new Date(entry.startTime);
      
      // Date range filter
      const isInDateRange = isWithinInterval(startDate, {
        start: dateRange.from,
        end: dateRange.to
      });
      
      // Project filter
      const matchesProject = selectedProject === 'all' || entry.projectId === selectedProject;
      
      // User filter
      const matchesUser = selectedUser === 'all' || 
        (typeof entry.user === 'string' ? entry.user === selectedUser : entry.user._id === selectedUser);
      
      return isInDateRange && matchesProject && matchesUser;
    }) as TimeEntry[];
  }, [timeEntriesQuery.data, dateRange, selectedProject, selectedUser]);

  // Calculate total time by project for pie chart
  const projectTimeSummary = React.useMemo(() => {
    return filteredEntries.reduce((acc: ProjectTimeSummary, entry) => {
      const projectId = entry.projectId || "unknown";
      const projectName = entry.projectName || "Unknown Project";
      
      if (!projectId) return acc;
      
      if (!acc[projectId]) {
        acc[projectId] = {
          name: projectName,
          value: 0,
          id: projectId
        };
      }
      
      acc[projectId].value += entry.duration;
      return acc;
    }, {} as ProjectTimeSummary);
  }, [filteredEntries]);
  
  const pieChartData = Object.values(projectTimeSummary) as ProjectChartDataPoint[];

  // Calculate time by day for bar chart
  const dailySummary = React.useMemo(() => {
    return filteredEntries.reduce((acc: DailySummary, entry) => {
      const day = format(new Date(entry.startTime), 'yyyy-MM-dd');
      
      if (!acc[day]) {
        acc[day] = {
          date: day,
          hours: 0,
          formattedDate: format(new Date(entry.startTime), 'MMM dd')
        };
      }
      
      acc[day].hours += entry.duration / 3600; // Convert seconds to hours
      return acc;
    }, {} as DailySummary);
  }, [filteredEntries]);
  
  const barChartData = Object.values(dailySummary)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) as ChartDataPoint[]; // Show last 14 days

  // Format duration from seconds to hours and minutes
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  // Total tracked time in seconds
  const totalTrackedTime = filteredEntries.reduce(
    (total, entry) => total + entry.duration, 
    0
  );

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl">Time Reports</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <DateRangePicker 
              dateRange={dateRange}
              onChange={setDateRange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectsQuery.data?.projects.map(project => (
                  <SelectItem key={project._id} value={project._id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <Select 
              value={selectedUser} 
              onValueChange={setSelectedUser}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {users.map(user => (
                  <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">No time entries for selected filters</h3>
            <p className="text-gray-500 mt-1">
              Try changing your filters or track more time
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-500">Total Time</div>
                  <div className="text-2xl font-bold mt-1">{formatTotalDuration(totalTrackedTime)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-500">Total Entries</div>
                  <div className="text-2xl font-bold mt-1">{filteredEntries.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-gray-500">Avg. Daily Hours</div>
                  <div className="text-2xl font-bold mt-1">
                    {(totalTrackedTime / 3600 / Object.keys(dailySummary).length).toFixed(1)}h
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">Time Overview</TabsTrigger>
                <TabsTrigger value="projects">Time by Project</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="pt-4">
                <h3 className="font-medium text-gray-700 mb-4">Daily Time Tracking</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis 
                        label={{ 
                          value: 'Hours', 
                          angle: -90, 
                          position: 'insideLeft'
                        }} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} hours`]} 
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="hours" fill="#4f46e5" name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="pt-4">
                <h3 className="font-medium text-gray-700 mb-4">Time Distribution by Project</h3>
                {pieChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }: ProjectChartDataPoint) => `${name}: ${(value / 3600).toFixed(1)}h`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${(value / 3600).toFixed(2)} hours`]} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No project data available for the selected filters
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};