import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeamMutationFn } from "@/lib/api/index";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export default function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: createTeamMutationFn,
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
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    
    mutate(
      {
        workspaceId,
        data: values,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["teams", workspaceId],
          });
          
          toast({
            title: "Success",
            description: "Team created successfully",
            variant: "success",
          });
          
          onClose();
        },
        onError: (error: {
          message?: string;
          errorCode?: string;
          response?: { status: number };
        }) => {
          
          // Simplified debugging
          console.log('Error details:', {
            message: error.message,
            errorCode: error.errorCode,
            status: error.response?.status
          });
          
        
          
          toast({
            title:"Error",
            description: error.message || "Failed to create team",
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
            Create Team
          </h1>
          <p className="text-muted-foreground text-sm leading-tight">
            Teams help you organize projects and members within your workspace.
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
                        placeholder="Engineering Team"
                        className="h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is how your team will appear in the workspace.
                    </FormDescription>
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
                        placeholder="This team is responsible for product development..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what this team does.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              disabled={isPending}
              className="w-full h-[40px] text-white font-semibold"
              type="submit"
            >
              {isPending && <Loader className="mr-2 animate-spin" />}
              Create Team
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}