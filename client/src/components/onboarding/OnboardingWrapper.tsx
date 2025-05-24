import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Logo from "@/components/logo";
import { OrganizationSetup, WorkspaceSetup, ProjectSetup } from "./steps";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";

export type OnboardingStep = "organization" | "workspace" | "project";

const OnboardingWrapper = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("organization");
  const [progress, setProgress] = useState(33.33);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Check authentication status when component mounts or refreshes
  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const nextStep = () => {
    // Verify authentication before proceeding to next step
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    
    if (currentStep === "organization") {
      setCurrentStep("workspace");
      setProgress(66.66);
    } else if (currentStep === "workspace") {
      setCurrentStep("project");
      setProgress(100);
    }
  };

  const handleComplete = (workspaceId: string) => {
    // Final authentication check before completion
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    navigate(`/workspace/${workspaceId}`);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  // If not authenticated and not loading, the useEffect will redirect
  // This renders while that's happening
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-[600px] flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Logo />
          KarmaBhumi
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === "organization" && "Create your organization"}
              {currentStep === "workspace" && "Set up your workspace"}
              {currentStep === "project" && "Create your first project"}
            </CardTitle>
            <CardDescription>
              {currentStep === "organization" &&
                "Tell us about your organization to get started"}
              {currentStep === "workspace" &&
                "Set up your workspace to start collaborating"}
              {currentStep === "project" &&
                "Choose a template for your first project"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === "organization" && (
              <OrganizationSetup onComplete={nextStep} />
            )}
            {currentStep === "workspace" && (
              <WorkspaceSetup onComplete={nextStep} />
            )}
            {currentStep === "project" && (
              <ProjectSetup onComplete={handleComplete} />
            )}
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
          By continuing, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default OnboardingWrapper;