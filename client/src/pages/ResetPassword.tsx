import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const [resetComplete, setResetComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tokenParam = params.get("token");
    if (!tokenParam) {
      toast({
        title: "Invalid link",
        description: "This password reset link is invalid or expired.",
        variant: "destructive",
      });
      setLocation("/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchString, setLocation, toast]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      if (!token) throw new Error("No token provided");
      const response = await apiRequest(
        "POST",
        "/api/auth/reset-password",
        {
          token,
          newPassword: values.newPassword,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      setResetComplete(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "This link may be invalid or expired. Please request a new password reset.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(values);
  };

  if (!token) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-back-login"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Back to Login
        </button>
        <Card className="w-full">
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <CardTitle className="text-xl sm:text-2xl">Create new password</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {resetComplete 
                ? "Your password has been successfully reset."
                : "Enter your new password below."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {resetComplete ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center p-4 bg-muted rounded-md">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                  You can now log in with your new password.
                </p>
                <Button
                  className="w-full text-xs sm:text-sm min-h-10 sm:min-h-11"
                  onClick={() => setLocation("/login")}
                  data-testid="button-go-to-login"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm">New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            className="text-xs sm:text-sm"
                            data-testid="input-new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Must be at least 8 characters
                        </FormDescription>
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
                            placeholder="Confirm new password"
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
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
