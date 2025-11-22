import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
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

const signupSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"), // Make email required for signup
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (values: SignupFormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/signup",
        values
      );
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/app");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: SignupFormValues) => {
    signupMutation.mutate(values);
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
            <CardTitle className="text-xl sm:text-2xl">Create an account</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Enter your details below to create your account
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className="text-xs sm:text-sm"
                        data-testid="input-email"
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
                    <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        className="text-xs sm:text-sm"
                        data-testid="input-confirm-password"
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
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </Form>
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-xs sm:text-sm text-primary hover:underline"
              data-testid="link-login"
            >
              Log in
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
