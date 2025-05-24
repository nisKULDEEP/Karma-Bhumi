import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useSidebar } from '@/context/sidebar-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Clock,
  Settings,
  ChevronLeft,
  PlusCircle,
  Search,
  BarChart2,
  ListTodo
} from 'lucide-react';

// Types for the sidebar items
type SidebarLinkType = {
  icon: React.ReactNode;
  label: string;
  href: (workspaceId: string) => string;
  badge?: number;
};

type TeamType = {
  id: string;
  name: string;
  color: string;
};

type ProjectType = {
  id: string;
  name: string;
  color: string;
};

// Sample data for sidebar navigation
const sidebarLinks: SidebarLinkType[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
    href: (workspaceId) => `/workspace/${workspaceId}`,
  },
  {
    icon: <ListTodo className="h-5 w-5" />,
    label: 'Tasks',
    href: (workspaceId) => `/workspace/${workspaceId}/tasks`,
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: 'Members',
    href: (workspaceId) => `/workspace/${workspaceId}/members`,
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: 'Time Tracking',
    href: (workspaceId) => `/workspace/${workspaceId}/time-tracking`,
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    href: (workspaceId) => `/workspace/${workspaceId}/settings`,
  },
];

// Sample teams data
const teams: TeamType[] = [
  { id: '1', name: 'Engineering', color: 'engineering' },
  { id: '2', name: 'Design', color: 'design' },
  { id: '3', name: 'Marketing', color: 'marketing' },
];

// Sample projects data
const projects: ProjectType[] = [
  { id: '1', name: 'Website Redesign', color: 'engineering' },
  { id: '2', name: 'Mobile App Development', color: 'design' },
  { id: '3', name: 'Marketing Campaign', color: 'marketing' },
  { id: '4', name: 'Product Launch', color: 'product' },
];

const Sidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-border transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[0px]'
      )}
    >
      {/* Logo/App Name */}
      <div className="flex items-center h-[60px] px-4 border-b border-border">
        {/* App Logo - always visible */}
        <div className="flex items-center">
          <div className="flex items-center justify-center bg-black text-white rounded h-8 w-8">
            <span className="text-sm font-bold">K</span>
          </div>
          
          {!collapsed && (
            <span className="font-semibold text-lg ml-2">KarmaBhumi</span>
          )}
        </div>
        
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="ml-auto text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform duration-300",
            collapsed ? "rotate-180" : ""
          )} />
        </button>
      </div>
      
      {/* Search - shown only when expanded */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="px-2 py-3 space-y-1">
        {sidebarLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.href(workspaceId || '')}
            className={({ isActive }) =>
              cn(
                'flex items-center px-2 py-2 rounded-md text-sm font-medium',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:bg-gray-100',
                collapsed && 'justify-center'
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="ml-3">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-4 bg-gray-200 text-gray-800 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Teams Section */}
      <div className="mt-2 px-2 py-3 border-t border-border">
        <div className={cn(
          "flex items-center text-sm font-medium text-gray-500 mb-2",
          collapsed && "justify-center"
        )}>
          {!collapsed && <span>Teams</span>}
        </div>
        <div className="space-y-1">
          {teams.map((team) => (
            <NavLink
              key={team.id}
              to={`/workspace/${workspaceId}/teams/${team.id}`}
              className="flex items-center px-2 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            >
              <span
                className={`h-2 w-2 rounded-full bg-team-${team.color}`}
              ></span>
              {!collapsed && <span className="ml-3">{team.name}</span>}
            </NavLink>
          ))}
          <button
            className={cn(
              "flex items-center w-full px-2 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100",
              collapsed && "justify-center"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-500" />
            {!collapsed && <span className="ml-3">Add Team</span>}
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mt-2 px-2 py-3 border-t border-border">
        <div className={cn(
          "flex items-center text-sm font-medium text-gray-500 mb-2",
          collapsed && "justify-center"
        )}>
          {!collapsed && <span>Projects</span>}
        </div>
        <div className="space-y-1">
          {projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/workspace/${workspaceId}/project/${project.id}`}
              className="flex items-center px-2 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
            >
              <span
                className={`h-2 w-2 rounded-full bg-team-${project.color}`}
              ></span>
              {!collapsed && <span className="ml-3">{project.name}</span>}
            </NavLink>
          ))}
          <button
            className={cn(
              "flex items-center w-full px-2 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100",
              collapsed && "justify-center"
            )}
          >
            <PlusCircle className="h-4 w-4 text-gray-500" />
            {!collapsed && <span className="ml-3">Add Project</span>}
          </button>
        </div>
      </div>

      {/* User section at bottom */}
      <div className="mt-auto px-2 py-3 border-t border-border">
        <div className={cn(
          "flex items-center p-2 rounded-md hover:bg-gray-100",
          collapsed && "justify-center"
        )}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              <span className="text-xs font-medium">U</span>
            </div>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;