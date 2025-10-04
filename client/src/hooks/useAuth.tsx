import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  accountTier: string;
  isAdmin: boolean;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
