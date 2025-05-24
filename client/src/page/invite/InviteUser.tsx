import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/Button";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import useAuth from "@/hooks/api/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api/index";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const InviteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  const param = useParams();
  const inviteCode = param.inviteCode as string;

  const { data: authData, isPending } = useAuth();
  const user = authData?.user;

  // Fetch workspace details from the invite code
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        const response = await fetch(`/workspace/invite/${inviteCode}`);
        const data = await response.json();
        if (data.workspace) {
          setWorkspaceName(data.workspace.name);
        }
      } catch (error) {
        console.error("Failed to fetch workspace details:", error);
      }
    };

    if (inviteCode) {
      fetchWorkspaceDetails();
    }
  }, [inviteCode]);

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.INVITE_URL.replace(":inviteCode", inviteCode)}`
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        setJoinSuccess(true);
        
        // Show a success toast
        toast({
          title: "Success!",
          description: `You've successfully joined ${workspaceName || "the workspace"}`,
          variant: "success",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/workspace/${data.workspaceId}`);
        }, 1500);
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          KarmaBhumi
        </Link>
        <div className="flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {workspaceName 
                  ? `You're invited to join ${workspaceName}!` 
                  : "You're invited to join a KarmaBhumi Workspace!"}
              </CardTitle>
              <CardDescription>
                {!user 
                  ? "Please log in or sign up to join this workspace."
                  : "Click below to join this workspace and start collaborating!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  {joinSuccess ? (
                    <div className="text-center py-6">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Workspace Joined!</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Successfully joined {workspaceName || "the workspace"}. Redirecting you now...
                      </p>
                    </div>
                  ) : user ? (
                    <div className="flex items-center justify-center my-3">
                      <form onSubmit={handleSubmit}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary/90 text-white text-lg py-6 px-8"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="w-5 h-5 mr-2 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            'Join Workspace'
                          )}
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-center mb-2">You need an account to join this workspace:</p>
                      <Link
                        className="w-full"
                        to={`/sign-up?returnUrl=${returnUrl}`}
                      >
                        <Button className="w-full bg-primary">Create Account</Button>
                      </Link>
                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>
                      <Link
                        className="w-full"
                        to={`/?returnUrl=${returnUrl}`}
                      >
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-xs text-muted-foreground">
                By joining this workspace, you agree to KarmaBhumi's Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteUser;
