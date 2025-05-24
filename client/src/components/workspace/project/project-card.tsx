import React from 'react';
import { CalendarDays, ArrowRight, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    status: string;
    emoji?: string;
    createdAt: string;
    updatedAt: string;
    tasksCount?: number;
    membersCount?: number;
    completedTasks?: number;
    totalTasks?: number;
    lastActivity?: string;
    members?: Array<{
      _id: string;
      name: string;
      profilePicture?: string;
    }>;
  };
  workspaceId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'planning':
      return 'bg-orange-100 text-orange-800';
    case 'not_started':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'planning':
      return 'Planning';
    case 'not_started':
      return 'Not Started';
    default:
      return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
};

const calculateProgress = (completedTasks: number, totalTasks: number) => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, workspaceId }) => {
  const navigate = useNavigate();
  
  const completedTasks = project.completedTasks || 0;
  const totalTasks = project.totalTasks || 0;
  const progress = calculateProgress(completedTasks, totalTasks);
  
  const handleClick = () => {
    navigate(`/workspace/${workspaceId}/project/${project._id}`);
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="mr-2 text-lg">
              {project.emoji || '📝'}
            </div>
            <div>
              <h3 className="font-medium text-base">{project.name}</h3>
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <CalendarDays className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-sm text-gray-500 mt-2 mb-3 line-clamp-2">{project.description}</p>
        )}
        
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {project.lastActivity 
                  ? `Last active ${formatDistanceToNow(new Date(project.lastActivity), { addSuffix: true })}`
                  : 'No recent activity'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{project.membersCount || 0} members</span>
            </div>
            <div className="text-gray-500">
              {completedTasks}/{totalTasks} tasks
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
        
        {project.members && project.members.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <AvatarGroup max={3}>
              {project.members.map((member) => (
                <Avatar key={member._id} className="h-6 w-6">
                  <AvatarImage src={member.profilePicture} alt={member.name} />
                  <AvatarFallback className="text-[10px]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            
            <div className="flex items-center text-primary hover:underline text-sm font-medium">
              <span>View Project</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;