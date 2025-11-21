import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Assessments from "@/pages/Assessments";
import NewAssessment from "@/pages/NewAssessment";
import Analytics from "@/pages/Analytics";
import Templates from "@/pages/Templates";
import AssessmentDetail from "@/pages/AssessmentDetail";
import Sites from "@/pages/Sites";
import ThreatLibrary from "@/pages/ThreatLibrary";
import ControlLibrary from "@/pages/ControlLibrary";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import TeamMembers from "@/pages/TeamMembers";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AcceptInvitation from "@/pages/AcceptInvitation";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Classes from "@/pages/Classes";
import Consulting from "@/pages/Consulting";
import Contact from "@/pages/Contact";
import WarehouseDashboard from "@/pages/assessments/WarehouseDashboard";
import NotFound from "@/pages/not-found";

function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <ProtectedRoute>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto p-3 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Landing} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/accept-invitation/:token">
            {(params) => <AcceptInvitation token={params.token} />}
          </Route>
          <Route path="/pricing" component={Pricing} />
          <Route path="/classes" component={Classes} />
          <Route path="/consulting" component={Consulting} />
          <Route path="/contact" component={Contact} />
          
          {/* Protected routes */}
          <Route path="/app">
            <ProtectedAppLayout>
              <Dashboard />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/dashboard">
            <ProtectedAppLayout>
              <Dashboard />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/assessments">
            <ProtectedAppLayout>
              <Assessments />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/assessments/new">
            <ProtectedAppLayout>
              <NewAssessment />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/assessments/:id">
            {(params) => (
              <ProtectedAppLayout>
                <AssessmentDetail assessmentId={params.id} />
              </ProtectedAppLayout>
            )}
          </Route>
          
          <Route path="/app/assessments/:id/warehouse">
            {(params) => (
              <ProtectedAppLayout>
                <WarehouseDashboard />
              </ProtectedAppLayout>
            )}
          </Route>
          
          <Route path="/app/analytics">
            <ProtectedAppLayout>
              <Analytics />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/templates">
            <ProtectedAppLayout>
              <Templates />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/sites">
            <ProtectedAppLayout>
              <Sites />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/libraries/threats">
            <ProtectedAppLayout>
              <ThreatLibrary />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/libraries/controls">
            <ProtectedAppLayout>
              <ControlLibrary />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/settings">
            <ProtectedAppLayout>
              <Settings />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/team">
            <ProtectedAppLayout>
              <TeamMembers />
            </ProtectedAppLayout>
          </Route>
          
          <Route path="/app/admin">
            <ProtectedAppLayout>
              <Admin />
            </ProtectedAppLayout>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
