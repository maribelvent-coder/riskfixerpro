import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requestSent, setRequestSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/request-password-reset",
        values
      );
      return response.json();
    },
    onSuccess: () => {
      setRequestSent(true);
      toast({
        title: "Check your email",
        description: "If an account exists with that email, we've sent password reset instructions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Unable to process request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    requestResetMutation.mutate(values);
  };

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
              <CardTitle className="text-xl sm:text-2xl">Reset your password</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {requestSent 
                ? "We've sent you an email with instructions to reset your password."
                : "Enter your email address and we'll send you instructions to reset your password."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {requestSent ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center p-4 bg-muted rounded-md">
                  <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                  Check your inbox and follow the link in the email to reset your password. 
                  The link will expire in 1 hour.
                </p>
                <p className="text-xs sm:text-sm text-center text-muted-foreground">
                  (Development note: For now, check the server console logs for the reset link)
                </p>
                <Button
                  variant="outline"
                  className="w-full text-xs sm:text-sm min-h-10 sm:min-h-11"
                  onClick={() => setLocation("/login")}
                  data-testid="button-back-to-login"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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
                  <Button
                    type="submit"
                    className="w-full text-xs sm:text-sm min-h-10 sm:min-h-11"
                    disabled={requestResetMutation.isPending}
                    data-testid="button-request-reset"
                  >
                    {requestResetMutation.isPending ? "Requesting..." : "Request password reset"}
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
