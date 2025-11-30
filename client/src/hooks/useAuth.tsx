import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  email: string | null;
  accountTier: string;
  isAdmin: boolean;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.status === 401) {
        return null; // Not authenticated, but not an error
      }
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
