import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { setupProjectMutationFn } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ProjectTemplateSelector from "@/components/workspace/project/project-template-selector";
import { toast } from "@/hooks/use-toast";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Please select a template"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectSetup() {
  const navigate = useNavigate();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      templateId: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: setupProjectMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Project created successfully",
        description: "Your project has been set up.",
        variant: "success",
      });
      // Navigate to the new workspace/project
      if (data.project?._id) {
        navigate(`/workspace/${data.project.workspace}/project/${data.project._id}`);
      } else {
        navigate("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create project",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    form.setValue("templateId", templateId);
  };

  const onSubmit = (values: ProjectFormValues) => {
    mutate({
      name: values.name,
      description: values.description,
      templateId: values.templateId,
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create your first project</h1>
          <p className="text-muted-foreground">
            Choose a template for your first project
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a project name" {...field} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Choose a name for your first project
                  </p>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
              render={() => (
                <FormItem>
                  <FormLabel>Choose a template</FormLabel>
                  <FormControl>
                    <ProjectTemplateSelector
                      selectedTemplateId={selectedTemplateId}
                      onSelectTemplate={handleTemplateSelect}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}