import { useState } from "react";
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
import { createTeamMutationFn } from "@/lib/api/team.api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters.").max(50, "Team name must be less than 50 characters."),
  description: z.string().min(5, "Description must be at least 5 characters.").max(200, "Description must be less than 200 characters."),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TeamDialog({ open, onClose }: TeamDialogProps) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Create team mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createTeamMutationFn,
    onSuccess: () => {
      toast({
        title: "Team created",
        description: "Your team has been created successfully.",
        variant: "success",
      });
      
      // Invalidate the teams query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["teams", workspaceId] });
      
      // Close dialog and reset form
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating team:", error);
      toast({
        title: "Failed to create team",
        description: "There was an error creating your team. Please try again.",
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
        name: data.name,
        description: data.description
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering, Marketing, Sales, etc." {...field} />
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
                      placeholder="Describe this team's purpose and focus..."
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
                  "Create Team"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}