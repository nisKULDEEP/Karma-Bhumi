import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDuration } from '@/lib/utils';
import useGetTimeReportsQuery from '@/hooks/api/use-get-time-reports';

interface TimeReportSummaryProps {
  workspaceId: string;
  projectId: string;
}

// Define proper interfaces for the time report summary data
interface UserSummary {
  userId: string;
  userName: string;
  totalDuration: number;
  billableDuration: number;
  entries: number;
}

interface TaskSummary {
  taskId: string;
  taskName: string;
  totalDuration: number;
  entries: number;
}

interface TimeSummary {
  totalDuration: number;
  billableDuration: number;
  timeEntryCount: number;
  userSummary: UserSummary[];
  taskSummary: TaskSummary[];
}

interface UserChartData {
  name: string;
  hours: number;
  fullName: string;
  billableHours: number;
  color: string;
}

interface TaskChartData {
  name: string;
  hours: number;
  fullName: string;
  entries: number;
  color: string;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Color palette for charts
const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6B7280'];

export const TimeReportSummary: React.FC<TimeReportSummaryProps> = ({
  workspaceId,
  projectId
}) => {
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Use the proper API hook for time reports
  const timeReportsQuery = useGetTimeReportsQuery(workspaceId, {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
    projectId: projectId
  });

  // Update summary when query data changes
  useEffect(() => {
    if (timeReportsQuery.data?.summary) {
      setSummary(timeReportsQuery.data.summary);
    }
  }, [timeReportsQuery.data]);

  // Convert data for user distribution chart
  const getUserChartData = (): UserChartData[] => {
    if (!summary?.userSummary) return [];
    
    return summary.userSummary.map((userData: UserSummary, index: number) => ({
      name: userData.userName.split(' ')[0], // Just use first name for chart
      hours: Number((userData.totalDuration / 3600).toFixed(2)), // Convert seconds to hours
      fullName: userData.userName,
      billableHours: Number((userData.billableDuration / 3600).toFixed(2)),
      color: COLORS[index % COLORS.length]
    }));
  };

  // Convert data for task distribution chart
  const getTaskChartData = (): TaskChartData[] => {
    if (!summary?.taskSummary) return [];
    
    return summary.taskSummary.map((taskData: TaskSummary, index: number) => ({
      name: taskData.taskName.length > 15 
        ? taskData.taskName.substring(0, 15) + '...' 
        : taskData.taskName,
      hours: Number((taskData.totalDuration / 3600).toFixed(2)), // Convert seconds to hours
      fullName: taskData.taskName,
      entries: taskData.entries,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Format seconds to hours for display
  const formatHours = (seconds: number) => {
    const hours = (seconds / 3600).toFixed(2);
    return `${hours} hr${hours === '1.00' ? '' : 's'}`;
  };

  // Percentage of billable hours
  const getBillablePercentage = () => {
    if (!summary?.totalDuration || summary.totalDuration === 0) return 0;
    return Math.round((summary.billableDuration / summary.totalDuration) * 100);
  };

  // Prepare data for pie chart
  const getPieChartData = (): PieChartData[] => {
    if (!summary) return [];
    
    return [
      { name: 'Billable', value: summary.billableDuration, color: '#10B981' },
      { name: 'Non-billable', value: summary.totalDuration - summary.billableDuration, color: '#6B7280' }
    ];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Time Reports</CardTitle>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => timeReportsQuery.refetch()}
            disabled={timeReportsQuery.isLoading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeReportsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !summary ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No time data available for this project.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatHours(summary.totalDuration)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatHours(summary.billableDuration)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({getBillablePercentage()}%)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Billable Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {summary.timeEntryCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Entries</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3 md:w-[400px]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">By User</TabsTrigger>
                <TabsTrigger value="tasks">By Task</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Billable vs Non-billable</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getPieChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => formatDuration(value)}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Top Contributors</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getUserChartData().slice(0, 5)} // Top 5 users
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip 
                            formatter={(value: any, name: any, props: any) => {
                              return [`${value} hours`, 'Time Spent'];
                            }}
                          />
                          <Bar dataKey="hours" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* By User Tab */}
              <TabsContent value="users">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hours by Team Member</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getUserChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            return [`${value} hours`, 
                              name === 'hours' ? 'Total Hours' : 'Billable Hours'
                            ];
                          }}
                          labelFormatter={(label: string) => {
                            const user = getUserChartData().find(u => u.name === label);
                            return user?.fullName || label;
                          }}
                        />
                        <Legend />
                        <Bar name="Total Hours" dataKey="hours" fill="#3B82F6" />
                        <Bar name="Billable Hours" dataKey="billableHours" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Team Member Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summary.userSummary.map((user: UserSummary) => (
                        <div 
                          key={user.userId} 
                          className="p-4 border rounded-lg"
                        >
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatHours(user.totalDuration)} total ({user.entries} entries)
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline">
                              {formatHours(user.billableDuration)} billable
                            </Badge>
                            <Badge variant={user.billableDuration > 0 ? "default" : "outline"}>
                              {user.totalDuration > 0 
                                ? Math.round((user.billableDuration / user.totalDuration) * 100) 
                                : 0}% billable
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* By Task Tab */}
              <TabsContent value="tasks">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hours by Task</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getTaskChartData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip 
                          formatter={(value: number) => [`${value} hours`, 'Time Spent']}
                          labelFormatter={(label: string) => {
                            const taskItem = getTaskChartData().find(t => t.name === label);
                            return taskItem?.fullName || label;
                          }}
                        />
                        <Legend />
                        <Bar name="Hours" dataKey="hours" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Task Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {summary.taskSummary.map((task: TaskSummary) => (
                        <div 
                          key={task.taskId} 
                          className="p-4 border rounded-lg"
                        >
                          <div className="font-medium truncate" title={task.taskName}>
                            {task.taskName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatHours(task.totalDuration)} ({task.entries} entries)
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline">
                              {((task.totalDuration / summary.totalDuration) * 100).toFixed(1)}% of total
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};