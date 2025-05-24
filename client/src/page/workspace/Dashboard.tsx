import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BarChart3, CheckCircle, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { 
  getDashboardStatsQueryFn, 
  getRecentProjectsQueryFn,
  getUpcomingTasksQueryFn,
  getActiveChallengesQueryFn
} from '@/lib/api/index';
import { useAuthContext } from '@/context/auth-provider';
import GameHero from '@/components/dashboard/GameHero';
import { ProjectType, TaskType } from '@/types/api.type';
import { TaskStatusEnum } from '@/types/task.types';

// Define Challenge interface at the top of the file
interface Challenge {
  id: string;
  title: string;
  progress: number;
  total: number;
  progressPercentage: number;
}

const Dashboard = () => {
  const workspaceId = useWorkspaceId();
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuthContext();

  // Fetch dashboard statistics
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats', workspaceId],
    queryFn: () => getDashboardStatsQueryFn({ workspaceId }),
    enabled: !!workspaceId,
  });

  // Fetch recent projects
  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['recent-projects', workspaceId],
    queryFn: () => getRecentProjectsQueryFn({ workspaceId, limit: 3 }),
    enabled: !!workspaceId,
  });

  // Fetch upcoming tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['upcoming-tasks', workspaceId],
    queryFn: () => getUpcomingTasksQueryFn({ workspaceId, limit: 3 }),
    enabled: !!workspaceId,
  });

  // Fetch active challenges
  const { data: challengesData, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['active-challenges'],
    queryFn: () => getActiveChallengesQueryFn(),
    enabled: !!workspaceId,
  });

  // Extract data
  const totalTasks = statsData?.totalTasks || 5;
  const completedTasks = statsData?.completedTasks || 1;
  const completionRate = statsData?.completionRate || 20;
  const timeTracked = statsData?.timeTracked || { hours: 32, minutes: 15 };
  const karmaPoints = statsData?.karmaPoints || 250;
  
  const recentProjects = projectsData?.projects || [];
  const upcomingTasks = tasksData?.tasks || [];
  const challenges = challengesData?.challenges || [
    {
      id: "1",
      title: "Complete 5 tasks today",
      progress: 3,
      total: 5,
      progressPercentage: 60
    },
    {
      id: "2", 
      title: "7-day streak",
      progress: 6,
      total: 7,
      progressPercentage: 85
    },
    {
      id: "3",
      title: "Team collaboration",
      progress: 3,
      total: 10,
      progressPercentage: 30
    }
  ];

  const currentLevel = 3;
  const nextLevel = 4;

  // Create skeleton components for each section
  const StatsCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );

  const ChallengeSkeleton = () => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  );

  const ProjectSkeleton = () => (
    <div className="flex items-center">
      <Skeleton className="w-2 h-2 rounded-full mr-2" />
      <div>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="ml-auto">
        <Skeleton className="h-5 w-16 rounded" />
      </div>
    </div>
  );

  const TaskSkeleton = () => (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-40 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="ml-4">
        <Skeleton className="h-5 w-20 rounded" />
      </div>
    </div>
  );

  return (
    <div>
      {/* Replace DashboardHero with GameHero */}
      <GameHero userName={user?.name || "User"} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="my-tasks" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            My Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="challenges" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Challenges
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Tasks Card */}
            {isLoadingStats ? <StatsCardSkeleton /> : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across {recentProjects.length || 4} projects</p>
                </CardContent>
              </Card>
            )}
            
            {/* Completed Tasks Card */}
            {isLoadingStats ? <StatsCardSkeleton /> : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">{completionRate}% completion rate</p>
                </CardContent>
              </Card>
            )}
            
            {/* Time Tracked Card */}
            {isLoadingStats ? <StatsCardSkeleton /> : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timeTracked.hours}h {timeTracked.minutes}m</div>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </CardContent>
              </Card>
            )}
            
            {/* Karma Points Card */}
            {isLoadingStats ? <StatsCardSkeleton /> : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Karma Points</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{karmaPoints}</div>
                  <p className="text-xs text-muted-foreground mt-1">Level {currentLevel} (65% to Level {nextLevel})</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground">Your team's activity across all projects</p>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[200px]">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="mx-auto h-16 w-16 opacity-50" />
                  <p className="mt-2">Activity chart will appear here</p>
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Active Challenges</CardTitle>
                <p className="text-sm text-muted-foreground">Your current progress</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingChallenges ? (
                  <>
                    <ChallengeSkeleton />
                    <ChallengeSkeleton />
                    <ChallengeSkeleton />
                  </>
                ) : (
                  challenges.map((challenge: Challenge) => (
                    <div key={challenge.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {challenge.id === '1' && <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />}
                          {challenge.id === '2' && <Clock className="h-4 w-4 text-amber-500 mr-2" />}
                          {challenge.id === '3' && <Trophy className="h-4 w-4 text-blue-500 mr-2" />}
                          <span className="text-sm font-medium">{challenge.title}</span>
                        </div>
                        <span className="text-sm">{challenge.progress}/{challenge.total}</span>
                      </div>
                      <Progress value={challenge.progressPercentage} 
                        className={
                          challenge.id === '1' ? 'bg-emerald-100' : 
                          challenge.id === '2' ? 'bg-amber-100' : 
                          'bg-blue-100'
                        }
                      />
                    </div>
                  ))
                )}

                <Button variant="outline" className="w-full mt-4">View All Challenges</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Projects */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <p className="text-sm text-muted-foreground">Your active projects</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingProjects ? (
                    <>
                      <ProjectSkeleton />
                      <ProjectSkeleton />
                      <ProjectSkeleton />
                    </>
                  ) : (
                    recentProjects.map((project: ProjectType & { status?: string; tasksCount?: number }, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-team-engineering mr-2"></div>
                        <div>
                          <h3 className="text-sm font-medium">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">{project.status}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="bg-muted text-xs px-2 py-1 rounded">{project.tasksCount} tasks</span>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <Button variant="outline" className="w-full mt-2">View All Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Tasks due soon</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingTasks ? (
                    <>
                      <TaskSkeleton />
                      <TaskSkeleton />
                      <TaskSkeleton />
                    </>
                  ) : (
                    upcomingTasks.map((task: TaskType, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{task.title}</h3>
                          <p className="text-xs text-muted-foreground">Due: {format(new Date(task.dueDate), 'MM/dd/yyyy')}</p>
                        </div>
                        <div className="ml-4">
                          <span className={`text-xs px-2 py-1 rounded ${task.status === TaskStatusEnum.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  <Button variant="outline" className="w-full mt-2">View All Tasks</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="my-tasks">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">My Tasks tab content coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="challenges">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Challenges tab content coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
