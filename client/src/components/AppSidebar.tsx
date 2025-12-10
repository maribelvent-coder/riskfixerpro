import { Home, FileText, BarChart3, Settings, Shield, AlertTriangle, Users, Search, Building2, ShieldCheck, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import logoPath from "@assets/riskfixer-logo-trimmed.png";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Assessments",
    url: "/app/assessments", 
    icon: FileText,
  },
  {
    title: "Sites",
    url: "/app/sites",
    icon: Building2,
  },
  {
    title: "Risk Analytics",
    url: "/app/analytics",
    icon: BarChart3,
  },
  {
    title: "Templates",
    url: "/app/templates",
    icon: Shield,
  },
];

const libraryItems = [
  {
    title: "Threat Library",
    url: "/app/libraries/threats",
    icon: AlertTriangle,
  },
  {
    title: "Control Library",
    url: "/app/libraries/controls",
    icon: ShieldCheck,
  },
];

const managementItems = [
  {
    title: "Team Members",
    url: "/app/team",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear JWT token from localStorage
      localStorage.removeItem('authToken');
      
      await apiRequest("POST", "/api/auth/logout");
      
      // Clear query cache to ensure fresh state on next login
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to login page
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4 pb-3">
        <div className="flex flex-col -my-2">
          <img 
            src={logoPath} 
            alt="RiskFixer - Security Site Survey" 
            className="h-20 w-auto object-cover object-center scale-110"
            data-testid="logo-sidebar"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reference</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    data-testid="nav-admin"
                  >
                    <Link href="/app/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}