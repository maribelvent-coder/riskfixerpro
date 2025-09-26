import { Home, FileText, BarChart3, Settings, Shield, AlertTriangle, Users, Search } from "lucide-react";
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
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Assessments",
    url: "/assessments", 
    icon: FileText,
  },
  {
    title: "Risk Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: Shield,
  },
];

const managementItems = [
  {
    title: "Team Members",
    url: "/team",
    icon: Users,
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: AlertTriangle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">SecureAssess</span>
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
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      console.log(`Navigate to ${item.title}`);
                    }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
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
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      console.log(`Navigate to ${item.title}`);
                    }}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}