import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

// Import dhtmlxgantt after the CSS to ensure styles are applied correctly
// We need to check if window is defined for SSR compatibility
declare const window: Window & {
  gantt: any;
};

// Function to load the gantt dynamically on the client side only
const loadGantt = async () => {
  if (typeof window !== 'undefined') {
    // Only import in browser environment
    await import('dhtmlx-gantt');
    return window.gantt;
  }
  return null;
};

interface GanttChartProps {
  workspaceId: string;
  projectId: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ workspaceId, projectId }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [ganttReady, setGanttReady] = useState(false);
  const ganttInstance = useRef<any>(null);
  const { toast } = useToast();

  // Initialize gantt
  useEffect(() => {
    const initGantt = async () => {
      try {
        // Load gantt library
        const gantt = await loadGantt();
        if (!gantt) return;
        ganttInstance.current = gantt;

        // Configure gantt
        gantt.config.date_format = "%Y-%m-%d %H:%i";
        gantt.config.drag_progress = true;
        gantt.config.show_progress = true;
        gantt.config.work_time = true;
        gantt.config.correct_work_time = true;
        gantt.config.duration_unit = "day";
        gantt.config.row_height = 40;
        gantt.config.min_column_width = 40;
        gantt.config.show_links = true;
        gantt.config.auto_scheduling = true;
        gantt.config.auto_scheduling_strict = true;
        gantt.config.xml_date = "%Y-%m-%d %H:%i";
        
        // Set columns for the left-side grid
        gantt.config.columns = [
          { name: "text", label: "Task name", tree: true, width: '*' },
          { name: "start_date", label: "Start date", align: "center", width: 120 },
          { name: "duration", label: "Duration", align: "center", width: 80 },
          { 
            name: "progress", 
            label: "Progress", 
            align: "center", 
            width: 80, 
            template: (task: any) => {
              return Math.round(task.progress * 100) + "%";
            }
          },
          { 
            name: "assigned", 
            label: "Assigned to", 
            align: "center", 
            width: 120,
            template: (task: any) => {
              return task.assignee_name || "";
            }
          }
        ];

        // Add task types and colors
        gantt.config.types = {
          task: "task",
          milestone: "milestone",
          project: "project"
        };

        gantt.templates.task_class = function(start: Date, end: Date, task: any) {
          let css = "";
          if (task.type == gantt.config.types.project) {
            css = "gantt-project";
          } else if (task.type == gantt.config.types.milestone) {
            css = "gantt-milestone";
          } else {
            // Color based on task status
            switch (task.status) {
              case "To Do":
                css = "task-status-todo";
                break;
              case "In Progress":
                css = "task-status-progress";
                break;
              case "Review":
                css = "task-status-review";
                break;
              case "Done":
                css = "task-status-done";
                break;
              case "Blocked":
                css = "task-status-blocked";
                break;
              default:
                css = "";
            }
          }
          return css;
        };

        // Tooltip template
        gantt.templates.tooltip_text = function(start: Date, end: Date, task: any) {
          return `<b>Task:</b> ${task.text}<br>
            <b>Start date:</b> ${gantt.templates.tooltip_date_format(start)}<br>
            <b>End date:</b> ${gantt.templates.tooltip_date_format(end)}<br>
            <b>Duration:</b> ${task.duration} days<br>
            <b>Progress:</b> ${Math.round(task.progress * 100)}%<br>
            <b>Assigned to:</b> ${task.assignee_name || "Unassigned"}<br>
            <b>Status:</b> ${task.status || ""}`;
        };

        // Custom lightbox (task editor)
        gantt.config.lightbox.sections = [
          { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
          { name: "type", type: "typeselect", map_to: "type" },
          { name: "time", type: "duration", map_to: "auto" }
        ];

        // After task is updated
        gantt.attachEvent("onAfterTaskUpdate", async (id: string, task: any) => {
          try {
            await axios.patch(`/gantt/workspace/${workspaceId}/task/${task.taskId}`, {
              startDate: task.start_date,
              endDate: task.end_date,
              progress: task.progress,
              dependencies: task.dependencies
            });
          } catch (error) {
            console.error("Failed to update task:", error);
            toast({
              title: "Failed to update task",
              description: "The changes could not be saved. Please try again.",
              variant: "destructive"
            });
            loadTasks(); // Reload tasks to restore the original state
          }
        });

        // After task link (dependency) is added
        gantt.attachEvent("onAfterLinkAdd", async (id: string, link: any) => {
          try {
            await axios.post(`/gantt/workspace/${workspaceId}/dependency`, {
              sourceTaskId: link.source,
              targetTaskId: link.target,
              type: link.type
            });
          } catch (error) {
            console.error("Failed to add dependency:", error);
            toast({
              title: "Failed to add dependency",
              description: "The dependency could not be created. Please try again.",
              variant: "destructive"
            });
            gantt.deleteLink(id); // Remove the link if it fails to save
          }
        });

        // After task link is deleted
        gantt.attachEvent("onAfterLinkDelete", async (id: string, link: any) => {
          try {
            await axios.delete(`/gantt/workspace/${workspaceId}/dependency/${link.dependencyId}`);
          } catch (error) {
            console.error("Failed to delete dependency:", error);
            toast({
              title: "Failed to delete dependency",
              description: "The dependency could not be removed. Please try again.",
              variant: "destructive"
            });
            loadTasks(); // Reload tasks to restore the original state
          }
        });

        // Apply styles for custom task types
        const customStyles = `
          .gantt-project {
            background-color: #4338CA;
            border-radius: 0;
          }
          .gantt-milestone {
            background-color: #F97316;
            border-radius: 50%;
          }
          .task-status-todo {
            background-color: #3B82F6;
          }
          .task-status-progress {
            background-color: #8B5CF6;
          }
          .task-status-review {
            background-color: #F59E0B;
          }
          .task-status-done {
            background-color: #10B981;
          }
          .task-status-blocked {
            background-color: #EF4444;
          }
          .weekend {
            background: #f8f8f8;
          }
        `;

        const styleElement = document.createElement('style');
        styleElement.innerHTML = customStyles;
        document.head.appendChild(styleElement);

        // Mark weekend days
        gantt.templates.scale_cell_class = function(date: Date) {
          if (date.getDay() === 0 || date.getDay() === 6) {
            return "weekend";
          }
          return "";
        };
        
        gantt.templates.timeline_cell_class = function(task: any, date: Date) {
          if (date.getDay() === 0 || date.getDay() === 6) {
            return "weekend";
          }
          return "";
        };

        // Initialize gantt in the container
        if (ganttContainer.current) {
          gantt.init(ganttContainer.current);
          setGanttReady(true);
        }
      } catch (error) {
        console.error("Error initializing Gantt chart:", error);
        toast({
          title: "Failed to initialize Gantt chart",
          description: "There was an error loading the project timeline.",
          variant: "destructive"
        });
      }
    };

    initGantt();

    // Cleanup
    return () => {
      if (ganttInstance.current) {
        ganttInstance.current.clearAll();
      }
    };
  }, []);

  // Load tasks when gantt is ready and projectId changes
  useEffect(() => {
    if (ganttReady && projectId) {
      loadTasks();
    }
  }, [ganttReady, projectId]);

  // Function to load tasks from API
  const loadTasks = useCallback(async () => {
    if (!ganttInstance.current) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/gantt/workspace/${workspaceId}/project/${projectId}`);
      
      // Clear existing data
      ganttInstance.current.clearAll();
      
      // Get tasks and links from response
      const { tasks, links } = response.data;
      
      // Parse dates before loading data
      const formattedTasks = tasks.map((task: any) => ({
        ...task,
        start_date: new Date(task.start_date),
        end_date: new Date(task.end_date)
      }));
      
      // Load data
      ganttInstance.current.parse({
        data: formattedTasks,
        links: links
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading Gantt data:", error);
      toast({
        title: "Failed to load project timeline",
        description: "There was an error loading the tasks. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [workspaceId, projectId]);

  // Zoom in/out functions
  const zoomIn = () => {
    if (!ganttInstance.current) return;
    
    let currentScale = ganttInstance.current.config.scale_unit;
    let newScale;
    
    if (currentScale === "month") {
      newScale = "week";
    } else if (currentScale === "week") {
      newScale = "day";
    } else if (currentScale === "day") {
      newScale = "hour";
    } else {
      return; // Already at highest zoom level
    }
    
    updateScale(newScale);
  };

  const zoomOut = () => {
    if (!ganttInstance.current) return;
    
    let currentScale = ganttInstance.current.config.scale_unit;
    let newScale;
    
    if (currentScale === "hour") {
      newScale = "day";
    } else if (currentScale === "day") {
      newScale = "week";
    } else if (currentScale === "week") {
      newScale = "month";
    } else {
      return; // Already at lowest zoom level
    }
    
    updateScale(newScale);
  };

  const updateScale = (scale: string) => {
    if (!ganttInstance.current) return;
    
    const gantt = ganttInstance.current;
    
    switch (scale) {
      case "hour":
        gantt.config.scale_unit = "hour";
        gantt.config.date_scale = "%H:%i";
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 30;
        gantt.config.subscales = [
          { unit: "day", step: 1, date: "%j %M" }
        ];
        break;
      case "day":
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%d %M";
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 70;
        gantt.config.subscales = [
          { unit: "hour", step: 6, date: "%H:%i" }
        ];
        break;
      case "week":
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "Week #%W";
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 120;
        gantt.config.subscales = [
          { unit: "day", step: 1, date: "%j %D" }
        ];
        break;
      case "month":
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F, %Y";
        gantt.config.scale_height = 60;
        gantt.config.min_column_width = 120;
        gantt.config.subscales = [
          { unit: "week", step: 1, date: "Week #%W" }
        ];
        break;
    }
    
    gantt.render();
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Project Timeline</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={zoomIn}
            disabled={loading}
          >
            Zoom In
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={zoomOut}
            disabled={loading}
          >
            Zoom Out
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadTasks}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100vh-220px)]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-background/50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <div
          ref={ganttContainer}
          className="gantt-container w-full h-full"
        />
      </CardContent>
    </Card>
  );
};