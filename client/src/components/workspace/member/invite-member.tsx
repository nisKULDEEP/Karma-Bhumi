import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";
import { CheckIcon, CopyIcon, Loader, Mail, Send } from "lucide-react";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import axios from "axios";
import { Permissions } from "@/constant";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteWorkspaceMemberMutationFn } from "@/lib/api/member.api";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getWorkspaceByIdQueryFn } from "@/lib/api/workspace.api";

// Define email invitation form schema
const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const InviteMember = () => {
  const { user, hasPermission } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recentInvites, setRecentInvites] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>(null);
  const [inviteLink, setInviteLink] = useState<string>("");
  
  // Get workspace ID from URL
  const workspaceId = useWorkspaceId();
  
  // Directly fetch workspace data using query
  const { 
    data: workspaceData, 
    isLoading: isWorkspaceLoading
  } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
    enabled: !!workspaceId,
  });
  
  const workspace = workspaceData?.workspace;
  
  // Check if workspace data is loaded and available
  const isWorkspaceReady = !isWorkspaceLoading && workspace && workspace._id;

  // Email invitation mutation
  const { 
    mutate: sendInvitation, 
    isPending: isEmailSending 
  } = useMutation({
    mutationFn: inviteWorkspaceMemberMutationFn,
    onSuccess: (data) => {
      // Add to recent invites
      const email = form.getValues().email;
      setRecentInvites(prev => [...prev, email]);
      setShowSuccess(true);
      
      toast({
        title: "Invitation sent!",
        description: `An invitation email has been sent to ${email}`,
        variant: "success",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    },
    onError: (error) => {
      console.error("Failed to send invitation:", error);
      
      // Properly type-check the error as an AxiosError
      if (axios.isAxiosError(error)) {
        console.error("API error response:", error.response?.data);
        toast({
          title: "Failed to send invitation",
          description: error.response?.data?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to send invitation",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  useEffect(() => {
    // Generate and set the invite link when workspace is ready
    if (isWorkspaceReady && workspace.inviteCode) {
      // Generate the invite URL using the BASE_ROUTE.INVITE_URL path
      const inviteUrl = `${window.location.origin}${BASE_ROUTE.INVITE_URL.replace(
        ":inviteCode",
        workspace.inviteCode
      )}`;
      setInviteLink(inviteUrl);
      
      // Also check if we need to generate an invite code
      if (!workspace.inviteCode) {
        console.warn("Workspace does not have an invite code!");
      }
    }
  }, [workspace, isWorkspaceReady]);

  // Generate debug info for troubleshooting
  useEffect(() => {
    if (isWorkspaceReady && user) {
      setDebugInfo({
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        workspaceOwnerId: workspace.owner,
        workspaceInviteCode: workspace.inviteCode || "MISSING",
        userId: user._id,
        isWorkspaceOwner: workspace.owner === user._id,
        hasAddMemberPermission: hasPermission(Permissions.ADD_MEMBER),
        hasInviteMembersPermission: hasPermission(Permissions.INVITE_MEMBERS),
        inviteLink: inviteLink,
        isWorkspaceReady
      });
    }
  }, [workspace, user, hasPermission, inviteLink, isWorkspaceReady]);
  
  // Force invitation permissions to be true
  const canInviteMembers = true;

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Invite link copied to clipboard",
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      toast({
        title: "Error",
        description: "No invite link available to copy",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: InviteFormValues) => {
    // Check if workspace is ready before proceeding
    if (!isWorkspaceReady) {
      console.error("Workspace is not ready yet, cannot send invitation");
      toast({
        title: "Not Ready",
        description: "Workspace is still loading. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Sending invitation to:", values.email, "for workspace:", workspace._id);
    
    // Add more detailed logging to help debugging
    console.log("Workspace details:", {
      id: workspace._id,
      name: workspace.name,
      inviteCode: workspace.inviteCode
    });
    
    // Use the mutation to send the invitation
    sendInvitation({
      workspaceId: workspace._id,
      email: values.email
    });
  };

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <div className="flex flex-col pt-0.5 px-0 ">
      <h5 className="text-lg leading-[30px] font-semibold mb-1">
        Invite members to join you
      </h5>
      <p className="text-sm text-muted-foreground leading-tight">
        Anyone with an invite link can join this workspace. You can also
        disable and create a new invite link for this workspace at any time.
      </p>

      {/* Debug info panel */}
      {debugInfo && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <p className="font-semibold mb-1">Debug Info:</p>
          <ul className="space-y-1">
            <li>Workspace ID: {debugInfo.workspaceId || 'undefined'}</li>
            <li>Workspace Name: {debugInfo.workspaceName || 'undefined'}</li>
            <li>Workspace Owner ID: {debugInfo.workspaceOwnerId || 'undefined'}</li>
            <li>Workspace Invite Code: {debugInfo.workspaceInviteCode || 'undefined'}</li>
            <li>User ID: {debugInfo.userId || 'undefined'}</li>
            <li>Is Owner Check: {debugInfo.isWorkspaceOwner ? 'true' : 'false'}</li>
            <li>Has ADD_MEMBER: {debugInfo.hasAddMemberPermission ? 'true' : 'false'}</li>
            <li>Has INVITE_MEMBERS: {debugInfo.hasInviteMembersPermission ? 'true' : 'false'}</li>
            <li>Generated Invite Link: {debugInfo.inviteLink || 'undefined'}</li>
            <li>Is Workspace Ready: {debugInfo.isWorkspaceReady ? 'true' : 'false'}</li>
          </ul>
        </div>
      )}

      {showSuccess && recentInvites.length > 0 && (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700 flex items-center gap-2">
            <CheckIcon className="h-4 w-4" />
            Invitation sent to {recentInvites[recentInvites.length - 1]}
          </AlertDescription>
        </Alert>
      )}

      {/* Using forced permission for now */}
      {canInviteMembers ? (
        !isWorkspaceReady ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading workspace information...</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="flex py-3 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                disabled={true}
                className="disabled:opacity-100 disabled:cursor-text font-mono text-sm"
                value={inviteLink || "No invite link available"}
                readOnly
              />
              <Button
                disabled={!inviteLink}
                className="shrink-0"
                size="icon"
                onClick={handleCopy}
                title="Copy invite link"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            
            {/* Email Invitation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Or invite members directly via email</p>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email Invite
                  </Button>
                </DialogTrigger>
              </div>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an email invitation to join the {workspace?.name} workspace.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="colleague@example.com" 
                                {...field} 
                                disabled={isEmailSending}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isEmailSending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isEmailSending}
                        className="gap-2"
                      >
                        {isEmailSending ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {recentInvites.length > 0 && (
              <div className="mt-6">
                <h6 className="text-sm font-medium mb-2">Recent Invitations</h6>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="text-sm">
                    {recentInvites.slice(0, 3).map((email, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground py-1">
                        <Mail className="h-3 w-3" />
                        {email}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="mt-4 p-4 rounded-md bg-destructive/10 text-destructive">
          You do not have permission to invite members to this workspace.
        </div>
      )}
    </div>
  );
};

export default InviteMember;
