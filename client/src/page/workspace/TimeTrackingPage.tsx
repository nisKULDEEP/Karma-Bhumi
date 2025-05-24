import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { getWorkspaceByIdQueryFn } from '@/lib/api/workspace.api';
import { WorkspaceWithMembersType } from '@/types/api.type';

const TimeTrackingPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<WorkspaceWithMembersType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;
      
      try {
        setLoading(true);
        const response = await getWorkspaceByIdQueryFn(workspaceId);
        setWorkspace(response.workspace);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workspace:', error);
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track time spent on projects and tasks in the {workspace?.name} workspace
          </p>
        </div>

        <TimeTracker workspaceId={workspaceId || ''} />
      </div>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;