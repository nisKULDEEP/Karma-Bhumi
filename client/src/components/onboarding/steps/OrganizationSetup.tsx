import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { initiateOnboardingMutationFn } from "@/lib/api/index";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-provider";
import { useEffect, useState } from "react";

const INDUSTRIES = [
  "Technology",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Other",
];

interface OrganizationSetupProps {
  onComplete: () => void;
}

const OrganizationSetup = ({ onComplete }: OrganizationSetupProps) => {
  const { user } = useAuth();
  const [useSignupCredentials, setUseSignupCredentials] = useState(true);
  
  const { mutate, isPending } = useMutation({
    mutationFn: initiateOnboardingMutationFn,
  });

  // Create a dynamic form schema based on whether we're using signup credentials
  const getFormSchema = () => {
    const baseSchema = {
      organization: z.object({
        name: z.string().trim().min(1, "Organization name is required"),
        subdomain: z
          .string()
          .trim()
          .min(3, "Subdomain must be at least 3 characters")
          .max(63, "Subdomain cannot exceed 63 characters")
          .regex(
            /^[a-zA-Z0-9-.]+$/,
            "Subdomain can only contain letters, numbers, hyphens, and periods"
          ),
        industry: z.string().optional(),
      }),
      useSignupCredentials: z.boolean().optional(),
    };

    // Only validate user fields if not using signup credentials
    if (useSignupCredentials) {
      return z.object({
        ...baseSchema,
        user: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          password: z.string().optional(),
        }),
      });
    } else {
      return z.object({
        ...baseSchema,
        user: z.object({
          name: z.string().trim().min(1, "Name is required"),
          email: z.string().trim().email("Invalid email address"),
          password: z
            .string()
            .trim()
            .min(8, "Password must be at least 8 characters"),
        }),
      });
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      organization: {
        name: "",
        subdomain: "",
        industry: undefined,
      },
      user: {
        name: user?.name || "",
        email: user?.email || "",
        password: "",
      },
      useSignupCredentials: true,
    },
  });

  // Update form validation when checkbox changes
  useEffect(() => {
    // Trigger re-validation when the checkbox state changes
    form.trigger();
  }, [useSignupCredentials, form]);

  // Update user fields when the checkbox state changes
  useEffect(() => {
    if (useSignupCredentials && user) {
      form.setValue("user.name", user.name || "");
      form.setValue("user.email", user.email || "");
      // Clear any validation errors for these fields
      form.clearErrors("user.name");
      form.clearErrors("user.email");
      form.clearErrors("user.password");
    }
  }, [useSignupCredentials, user, form]);

  const onSubmit = (values: any) => {
    if (isPending) return;

    // If using signup credentials, no need to send password again
    const submissionValues = {
      organization: values.organization,
      user: useSignupCredentials
        ? { 
            name: user?.name || "",
            email: user?.email || "",
            useExistingUser: true // Tell backend we're using existing user
          }
        : values.user,
    };

    mutate(submissionValues, {
      onSuccess: () => {
        onComplete();
      },
      onError: (error: any) => {
        // If there are field-specific validation errors, set them on the form
        if (error.validationErrors) {
          error.validationErrors.forEach((validationError: any) => {
            if (validationError.path && validationError.path.length) {
              // Map API error paths to form field paths
              const fieldPath = `organization.${validationError.path[0]}`;
              form.setError(fieldPath, {
                type: validationError.validation || "validation",
                message: validationError.message
              });
            }
          });
          
          toast({
            title: "Validation Error",
            description: "Please correct the errors in the form.",
            variant: "destructive",
          });
        } else {
          // Fall back to generic error message if no validation errors
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="organization.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Corporation"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization.subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose a subdomain</FormLabel>
                <FormControl>
                  <Input
                    placeholder="acme"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization.industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Admin Account
              </span>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="useSignupCredentials"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={useSignupCredentials}
                    onCheckedChange={(checked) => {
                      setUseSignupCredentials(!!checked);
                      field.onChange(!!checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use my signup credentials for admin account</FormLabel>
                  <FormDescription>
                    Use the name and email you just signed up with
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    className="h-11"
                    disabled={useSignupCredentials}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="h-11"
                    disabled={useSignupCredentials}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!useSignupCredentials && (
            <FormField
              control={form.control}
              name="user.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

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

export default OrganizationSetup;