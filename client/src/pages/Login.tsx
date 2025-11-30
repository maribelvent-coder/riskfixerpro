import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Shield, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      console.log("🔐 Frontend: Attempting login with:", values.username);
      console.log("🔐 Frontend: About to call fetch...");
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });
        console.log("🔐 Frontend: Fetch completed, status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("🔐 Frontend: Server error:", errorText);
          throw new Error(`${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log("🔐 Frontend: Login successful, user:", data.username);
        return data;
      } catch (error) {
        console.error("🔐 Frontend: Login error:", error);
        throw error;
      }
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/app");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    console.log("🔐 Form submitted with values:", values);
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
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => setLocation("/signup")}
              className="text-xs sm:text-sm text-primary hover:underline"
              data-testid="link-signup"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
