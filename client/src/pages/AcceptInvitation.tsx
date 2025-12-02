import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, Loader2, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AcceptInvitationPageProps = {
  token: string;
};

type InvitationDetails = {
  email: string;
  organizationName: string;
  role: string;
  expiresAt: string;
  status: string;
};

export default function AcceptInvitation({ token }: AcceptInvitationPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);

  // Check if user is already logged in
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Fetch invitation details (not implemented in backend yet, will show basic UI)
  const { data: invitation, isLoading: loadingInvitation } = useQuery<InvitationDetails>({
    queryKey: ["/api/invitations", token, "details"],
    enabled: false, // Disabled for now since backend doesn't have this endpoint yet
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/invitations/${token}/accept`);
    },
    onSuccess: () => {
      setAccepted(true);
      toast({
        title: "Invitation accepted",
        description: "You've successfully joined the organization!",
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        setLocation("/app");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept invitation",
        description: error.message || "The invitation may have expired or already been used.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!user) {
      // Redirect to login with return URL
      setLocation(`/login?returnTo=/accept-invitation/${token}`);
      return;
    }
    acceptMutation.mutate();
  };

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle>Successfully Joined!</CardTitle>
                <CardDescription>Redirecting to your dashboard...</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Organization Invitation</CardTitle>
              <CardDescription>
                {user ? "Accept invitation to join" : "Please log in to accept"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                You need to be logged in to accept this invitation. You'll be redirected back here after logging in.
              </p>
            </div>
          )}

          {acceptMutation.isError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  Failed to Accept Invitation
                </p>
              </div>
              <p className="text-sm text-destructive/90">
                {(acceptMutation.error as any)?.message || "The invitation may have expired or already been used."}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
              className="w-full"
              data-testid="button-accept-invitation"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {user ? "Accept Invitation" : "Log In to Accept"}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
