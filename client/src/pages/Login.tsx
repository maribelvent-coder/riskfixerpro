import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft, AlertCircle, Clock } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      // Clear any previous error when attempting login
      setLoginError(null);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Invalid username or password");
      }
      
      return response.json();
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      // Use refetchQueries instead of invalidateQueries to wait for the data to be fetched
      // This ensures the ProtectedRoute sees the authenticated state before navigation
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/app/dashboard");
    },
    onError: (error: Error) => {
      // Set inline error message instead of throwing
      setLoginError(error.message || "Invalid username or password. Please try again.");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    // Use mutate instead of mutateAsync to prevent unhandled rejection
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-back-home"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Back to Home
        </button>
        
        {/* Coming Soon Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4" data-testid="banner-coming-soon">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Coming Soon for New Users</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                We're not accepting new registrations at this time. If you already have an account, please log in below.
              </p>
            </div>
          </div>
        </div>
        
        <Card className="w-full">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className="text-xs sm:text-sm"
                        data-testid="input-username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => setLocation("/forgot-password")}
                        className="text-xs sm:text-sm text-primary hover:underline"
                        data-testid="link-forgot-password"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="text-xs sm:text-sm"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              
              {/* Inline error message */}
              {loginError && (
                <Alert variant="destructive" className="py-2" data-testid="alert-login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                className="w-full text-xs sm:text-sm min-h-10 sm:min-h-11"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
