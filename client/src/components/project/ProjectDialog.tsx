import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";

// Import the project creation API function
import { createProjectMutationFn } from "@/lib/api/project.api";

const formSchema = z.object({
  emoji: z.string().min(1, "Emoji is required").max(10),
  name: z.string().min(2, "Project name must be at least 2 characters").max(50, "Project name must be less than 50 characters"),
  description: z.string().min(5, "Description must be at least 5 characters").max(200, "Description must be less than 200 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectDialog({ open, onClose }: ProjectDialogProps) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emoji: "📝",
      name: "",
      description: "",
    },
  });

  // Create project mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
        variant: "success",
      });
      
      // Invalidate the projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      
      // Close dialog and reset form
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: FormValues) {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "No workspace selected.",
        variant: "destructive",
      });
      return;
    }
    
    mutate({
      workspaceId,
      data: {
        emoji: data.emoji,
        name: data.name,
        description: data.description
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Icon</FormLabel>
                  <FormControl>
                    <Input placeholder="📝" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign, Mobile App, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this project is about..."
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}