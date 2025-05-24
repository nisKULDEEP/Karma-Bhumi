import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuthQuery from "@/hooks/api/use-auth"; // Updated import name
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading, isError } = useAuthQuery(); // Updated hook name
  const user = authData?.user;

  const _isAuthRoute = isAuthRoute(location.pathname);

  // Show loading state only when we're not on an auth page
  if (isLoading && !_isAuthRoute) return <DashboardSkeleton />;
  
  // If there's an error fetching authentication or user is not authenticated,
  // allow rendering auth pages (login, register, etc.)
  if (isError || !user) return <Outlet />;

  // If user is authenticated and trying to access an auth page,
  // redirect to their workspace
  if (user?.currentWorkspace?._id) {
    return <Navigate to={`/workspace/${user.currentWorkspace._id}`} replace />;
  }
  
  // Handle case where user is authenticated but has no workspace
  return <Navigate to="/onboarding" replace />;
};

export default AuthRoute;
