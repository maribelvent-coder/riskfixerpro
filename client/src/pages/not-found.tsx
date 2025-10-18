import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [attemptedPath, setAttemptedPath] = useState("");

  useEffect(() => {
    // Capture the attempted path
    setAttemptedPath(window.location.pathname);
  }, []);

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoDashboard = () => {
    setLocation("/app/dashboard");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle className="text-2xl">Page Not Found</CardTitle>
              <CardDescription className="mt-1">
                The page you're looking for doesn't exist or hasn't been built yet
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {attemptedPath && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                Attempted to access: <span className="font-mono text-foreground">{attemptedPath}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Here are some options to get you back on track:
            </p>
            
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleGoDashboard}
                    className="w-full"
                    data-testid="button-go-dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    className="w-full"
                    data-testid="button-go-home"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home Page
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleGoHome}
                    className="w-full"
                    data-testid="button-go-home"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home Page
                  </Button>
                  <Button
                    onClick={() => setLocation("/login")}
                    variant="outline"
                    className="w-full"
                    data-testid="button-go-login"
                  >
                    Log In
                  </Button>
                </>
              )}
              <Button
                onClick={handleGoBack}
                variant="ghost"
                className="w-full"
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
