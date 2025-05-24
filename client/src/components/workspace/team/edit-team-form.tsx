import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTeamMutationFn } from "@/lib/api/index";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { TeamType } from "@/types/api.type";
import { useEffect } from "react";

// Updating the props interface to match EditTeamDialog
interface EditTeamFormProps {
  team: Pick<TeamType, '_id' | 'name' | 'description'> & {
    memberCount?: number;
    projectCount?: number;
  };
  onClose: () => void;
}

export default function EditTeamForm({ team, onClose }: EditTeamFormProps) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: editTeamMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Team name is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name || "",
      description: team.description || "",
    },
  });

  // Update form when team data changes
  useEffect(() => {
    form.reset({
      name: team.name || "",
      description: team.description || "",
    });
  }, [team, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    
    mutate(
      {
        workspaceId,
        teamId: team._id,
        data: values,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["teams", workspaceId],
          });
          
          toast({
            title: "Success",
            description: "Team updated successfully",
            variant: "success",
          });
          
          onClose();
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

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 border-b pb-2">
          <h1 className="text-xl tracking-[-0.16px] font-semibold mb-1 text-center sm:text-left">
            Edit Team
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Update your team's details
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Team name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Team description
                      <span className="text-xs font-extralight ml-2">
                        Optional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
              >
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Update Team
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}