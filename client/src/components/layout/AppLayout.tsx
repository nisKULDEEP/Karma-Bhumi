import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar, SidebarProvider } from "@/context/sidebar-context";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";

interface AppLayoutProps {
  children: ReactNode;
}

// Component to handle layout after SidebarProvider is established
const LayoutContent: React.FC<AppLayoutProps> = ({ children }) => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="h-screen flex overflow-hidden bg-backgroundAlt">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 overflow-hidden",
        collapsed ? 'ml-[60px]' : 'ml-[0px]'
      )}>
        {/* Header */}
        <AppHeader />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Global Dialogs */}
      <CreateWorkspaceDialog />
      <CreateProjectDialog />
    </div>
  );
};

// Main AppLayout component that wraps everything in SidebarProvider
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;