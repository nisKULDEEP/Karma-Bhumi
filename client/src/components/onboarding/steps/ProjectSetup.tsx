import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout, List, BarChart2, Users, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProjectTemplatesQueryFn, setupProjectMutationFn } from "@/lib/api/index";
import { toast } from "@/hooks/use-toast";
import { ProjectSetupResponseType, ProjectTemplateType, TaskStatusType } from "@/types/api.type";

interface ProjectSetupProps {
  onComplete: (workspaceId: string) => void;
}

// Map template categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  SCRUM: <List size={24} />,
  KANBAN: <Layout size={24} />,
  MARKETING: <BarChart2 size={24} />,
  SALES: <Users size={24} />
};

// Fallback templates in case API doesn't return any
const fallbackTemplates = [
  {
    _id: "scrum-template",
    name: "Scrum Project",
    category: "SCRUM",
    description: "Template for Scrum teams with sprint planning and backlog management",
    defaultView: "BOARD",
    taskStatuses: [
      { name: "Backlog", color: "#6B7280" },
      { name: "To Do", color: "#3B82F6" },
      { name: "In Progress", color: "#8B5CF6" },
      { name: "Review", color: "#F59E0B" },
      { name: "Done", color: "#10B981" }
    ]
  },
  {
    _id: "kanban-template",
    name: "Kanban Board",
    category: "KANBAN",
    description: "Simple Kanban board for visualizing work progress",
    defaultView: "BOARD",
    taskStatuses: [
      { name: "To Do", color: "#3B82F6" },
      { name: "In Progress", color: "#8B5CF6" },
      { name: "Done", color: "#10B981" }
    ]
  }
];

const ProjectSetup = ({ onComplete }: ProjectSetupProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["projectTemplates"],
    queryFn: getProjectTemplatesQueryFn,
  });

  const { mutate, isPending } = useMutation<ProjectSetupResponseType, Error, {
    name: string;
    description?: string;
    templateId: string;
  }>({
    mutationFn: setupProjectMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, "Project name is required"),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    // Only set the selected template if it's different from the current one
    setSelectedTemplate(currentTemplate => 
      currentTemplate === templateId ? null : templateId
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a project template",
        variant: "destructive",
      });
      return;
    }

    if (isPending) return;

    mutate(
      {
        ...values,
        templateId: selectedTemplate,
      },
      {
        onSuccess: (data) => {
          onComplete(data.workspace._id);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  // Use templates from API or fallback to our predefined ones if none available
  const templates = (templatesData?.templates?.length ? templatesData.templates : fallbackTemplates) as ProjectTemplateType[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input placeholder="Website Redesign" className="h-11" {...field} />
              </FormControl>
              <FormDescription>Choose a name for your first project</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Description
                <Badge variant="outline" className="font-normal text-xs">Optional</Badge>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your project"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Choose a template</h3>
            <p className="text-sm text-muted-foreground">
              Select a template that best matches your project needs
            </p>
          </div>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              <span>Loading templates...</span>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid gap-4">
                {templates.map((template: ProjectTemplateType) => {
                  const isSelected = selectedTemplate === template._id;
                  return (
                    <Card
                      key={template._id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : 'border'
                      }`}
                      onClick={() => handleTemplateSelect(template._id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                            {categoryIcons[template.category] || <Layout size={24} />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant={isSelected ? "default" : "outline"} className="mt-1">
                                {template.category.toLowerCase()}
                              </Badge>
                              <Badge variant="outline" className="mt-1">
                                {template.defaultView.toLowerCase()} view
                              </Badge>
                              <Badge variant="outline" className="mt-1">
                                {template.taskStatuses.length} statuses
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.taskStatuses.map((status: TaskStatusType) => (
                                <div
                                  key={status.name}
                                  className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold"
                                  style={{ borderColor: status.color, color: status.color }}
                                >
                                  {status.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Complete Setup
        </Button>
      </form>
    </Form>
  );
};

export default ProjectSetup;