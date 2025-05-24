export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  LOGIN: "/login", // Added a login route
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
  GOOGLE_CALLBACK: "/google/callback",
  ONBOARDING: "/onboarding",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TEAMS: "/workspace/:workspaceId/teams",
  TEAM_DETAIL: "/workspace/:workspaceId/team/:teamId",
  TEAM_PROJECTS: "/workspace/:workspaceId/teams/:teamId/projects",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  PROJECT_BOARD: "/workspace/:workspaceId/project/:projectId/board",
  TIME_TRACKING: "/workspace/:workspaceId/time-tracking",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/:inviteCode",
  INVITE_URL_LONG: "/invite/workspace/:inviteCode/join", // Keep the old format for backward compatibility
};
