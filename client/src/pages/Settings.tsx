import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { LogOut, User, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (values: EmailFormValues) => {
      const response = await apiRequest("PATCH", "/api/auth/me", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Email updated",
        description: "Your email address has been updated successfully.",
      });
      setIsEditingEmail(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const onSubmitEmail = (values: EmailFormValues) => {
    updateEmailMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-settings">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Username</div>
              <div className="text-base" data-testid="text-username">{user?.username}</div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Account Tier</div>
              <div className="text-base capitalize" data-testid="text-account-tier">
                {user?.accountTier || 'free'}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              {isEditingEmail ? (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Add your email to enable password reset functionality
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateEmailMutation.isPending}
                        data-testid="button-save-email"
                      >
                        {updateEmailMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingEmail(false);
                          emailForm.reset();
                        }}
                        data-testid="button-cancel-email"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-base" data-testid="text-email">
                    {user?.email || <span className="text-muted-foreground">No email set</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingEmail(true)}
                    data-testid="button-edit-email"
                  >
                    {user?.email ? "Edit" : "Add Email"}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-muted-foreground">Member Since</div>
              <div className="text-base" data-testid="text-created-at">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Session
            </CardTitle>
            <CardDescription>
              Sign out of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
