import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { setupWorkspaceMutationFn } from "@/lib/api/index";
import { toast } from "@/hooks/use-toast";

interface WorkspaceSetupProps {
  onComplete: () => void;
}

const WorkspaceSetup = ({ onComplete }: WorkspaceSetupProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: setupWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, "Workspace name is required"),
    description: z.string().optional(),
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

    mutate(values, {
      onSuccess: () => {
        onComplete();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Marketing"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is what your team will see as the workspace name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description
                <span className="text-xs font-extralight ml-2">Optional</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Our team organizes marketing projects and tasks here"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Give your team a brief overview of what this workspace is for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11"
          disabled={isPending}
        >
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </Form>
  );
};

export default WorkspaceSetup;