import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "../context/AuthContext";

export const InvitePage = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<{ workspaceName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details to show workspace name
  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const { data } = await axios.get(`/workspace/invite/${inviteCode}`);
        setInviteDetails(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch invite details:", err);
        setError(err.response?.data?.message || "Invalid invite link");
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) {
      fetchInviteDetails();
    }
  }, [inviteCode]);

  const handleAcceptInvite = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/member/workspace/${inviteCode}/join`);
      
      toast({
        title: "Invitation accepted!",
        description: "You've successfully joined the workspace.",
        variant: "default",
      });
      
      // Navigate to the workspace
      navigate(`/workspace/${data.workspaceId}`);
    } catch (err: any) {
      console.error("Failed to accept invitation:", err);
      toast({
        title: "Failed to join workspace",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignInFirst = () => {
    // Save the invitation URL to localStorage so we can redirect back after login
    localStorage.setItem('pendingInvite', window.location.pathname);
    navigate('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle className="text-xl">Workspace Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {inviteDetails?.workspaceName || "a workspace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Join this workspace to collaborate with your team on projects and tasks.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {isAuthenticated ? (
            <Button onClick={handleAcceptInvite} className="w-full">
              Accept Invitation
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                You need to sign in or create an account to accept this invitation.
              </p>
              <Button onClick={handleSignInFirst} className="w-full">
                Sign In to Accept
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};