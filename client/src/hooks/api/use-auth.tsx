import { getCurrentUserQueryFn } from "@/lib/api/index";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    // Keep auth data fresh for 5 minutes before refetching
    staleTime: 5 * 60 * 1000, 
    // Only retry once to reduce API calls on failure
    retry: 1,
    // Don't refetch on window focus to prevent unnecessary API calls
    refetchOnWindowFocus: false,
  });
  return query;
};

export default useAuth;
