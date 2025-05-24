import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import GoogleCallbackPage from "@/page/google-callback";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import ProjectBoard from "@/page/workspace/ProjectBoard";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import Teams from "@/page/workspace/Teams";
import TeamDetail from "@/page/workspace/TeamDetail";
import TeamProjects from "@/page/workspace/TeamProjects";
import TimeTrackingPage from "@/page/workspace/TimeTrackingPage";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.LOGIN, element: <SignIn /> }, // Added login route pointing to the same SignIn component
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
  { path: AUTH_ROUTES.GOOGLE_CALLBACK, element: <GoogleCallbackPage /> },
  { path: AUTH_ROUTES.ONBOARDING, element: <OnboardingWrapper /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TEAMS, element: <Teams /> },
  { path: PROTECTED_ROUTES.TEAM_DETAIL, element: <TeamDetail /> },
  { path: PROTECTED_ROUTES.TEAM_PROJECTS, element: <TeamProjects /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
  { path: PROTECTED_ROUTES.PROJECT_BOARD, element: <ProjectBoard /> },
  { path: PROTECTED_ROUTES.TIME_TRACKING, element: <TimeTrackingPage /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
  { path: BASE_ROUTE.INVITE_URL_LONG, element: <InviteUser /> }, // Add the old format for backward compatibility
];
