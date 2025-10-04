import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Server, Package, ShoppingCart, Factory, Heart, GraduationCap, Landmark, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentApi } from "@/lib/api";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  assetTypes: string[];
  commonRisks: string[];
  typicalControls: string[];
}

const templates: Template[] = [
  {
    id: "office-building",
    name: "Office Building",
    description: "Standard commercial office space with workstations, meeting rooms, and common areas",
    icon: Building2,
    category: "Commercial",
    assetTypes: ["Personnel", "IT Equipment", "Confidential Data", "Office Assets"],
    commonRisks: ["Unauthorized Access", "Theft of Equipment", "Data Breach", "Workplace Violence"],
    typicalControls: ["Access Control System", "CCTV Surveillance", "Visitor Management", "Security Guards"]
  },
  {
    id: "data-center",
    name: "Data Center",
    description: "High-security facility housing servers, network equipment, and critical IT infrastructure",
    icon: Server,
    category: "Technology",
    assetTypes: ["Server Infrastructure", "Network Equipment", "Critical Data", "Power Systems"],
    commonRisks: ["Physical Intrusion", "Environmental Damage", "Power Failure", "Equipment Theft"],
    typicalControls: ["Biometric Access", "24/7 Surveillance", "Environmental Monitoring", "Redundant Power"]
  },
  {
    id: "warehouse",
    name: "Warehouse / Distribution Center",
    description: "Storage and logistics facility with inventory, loading docks, and material handling",
    icon: Package,
    category: "Industrial",
    assetTypes: ["Inventory", "Equipment", "Vehicles", "Personnel"],
    commonRisks: ["Cargo Theft", "Unauthorized Entry", "Vehicle Accidents", "Inventory Shrinkage"],
    typicalControls: ["Perimeter Fencing", "Gate Access Control", "Dock Security", "Inventory Tracking"]
  },
  {
    id: "retail-store",
    name: "Retail Store",
    description: "Customer-facing retail location with merchandise, cash handling, and public access",
    icon: ShoppingCart,
    category: "Retail",
    assetTypes: ["Merchandise", "Cash/Payment Systems", "Personnel", "Customer Data"],
    commonRisks: ["Shoplifting", "Robbery", "Employee Theft", "Customer Injury"],
    typicalControls: ["EAS Systems", "POS Surveillance", "Safe Drop Procedures", "Staff Training"]
  },
  {
    id: "manufacturing",
    name: "Manufacturing Facility",
    description: "Industrial production facility with machinery, raw materials, and production lines",
    icon: Factory,
    category: "Industrial",
    assetTypes: ["Production Equipment", "Raw Materials", "Finished Goods", "Intellectual Property"],
    commonRisks: ["Industrial Espionage", "Sabotage", "Equipment Damage", "Supply Chain Disruption"],
    typicalControls: ["Restricted Access Zones", "CCTV Coverage", "Cybersecurity Measures", "Background Checks"]
  },
  {
    id: "healthcare",
    name: "Healthcare Facility",
    description: "Medical facility with patient care areas, pharmaceutical storage, and medical records",
    icon: Heart,
    category: "Healthcare",
    assetTypes: ["Patients", "Medical Equipment", "Pharmaceuticals", "Patient Records"],
    commonRisks: ["Infant Abduction", "Drug Theft", "Violence Against Staff", "HIPAA Violations"],
    typicalControls: ["Infant Security Systems", "Pharmacy Access Control", "Panic Buttons", "Privacy Protocols"]
  },
  {
    id: "education",
    name: "Educational Institution",
    description: "School or university campus with classrooms, labs, dormitories, and common areas",
    icon: GraduationCap,
    category: "Education",
    assetTypes: ["Students", "Staff", "Educational Equipment", "Research Data"],
    commonRisks: ["Active Shooter", "Unauthorized Access", "Bullying/Violence", "Theft of Equipment"],
    typicalControls: ["Controlled Entry Points", "Emergency Notification", "Visitor Screening", "Campus Police"]
  },
  {
    id: "government",
    name: "Government Building",
    description: "Public sector facility with classified areas, sensitive information, and public services",
    icon: Landmark,
    category: "Government",
    assetTypes: ["Classified Information", "Public Officials", "IT Systems", "Citizens"],
    commonRisks: ["Terrorism", "Espionage", "Cyber Attack", "Public Disruption"],
    typicalControls: ["Security Clearances", "Screening Technology", "Armed Security", "Cyber Defense"]
  }
];

export default function Templates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFromTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      return assessmentApi.create({
        title: `${template.name} - Security Assessment`,
        location: "",
        assessor: "",
        status: "draft"
      });
    },
    onSuccess: (data, template) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Assessment Created",
        description: `Created new assessment from ${template.name} template`,
      });
      setLocation(`/app/assessments/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assessment from template",
        variant: "destructive",
      });
    }
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6" data-testid="page-templates">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-templates">
          Assessment Templates
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-templates-description">
          Start with pre-configured templates for common facility types
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-templates"
        />
      </div>

      {/* Category Badges */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge key={category} variant="secondary" data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No templates found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover-elevate transition-all"
              data-testid={`card-template-${template.id}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <template.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl" data-testid={`title-${template.id}`}>
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Asset Types */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Typical Assets</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.assetTypes.map((asset, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Common Risks */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Common Risk Scenarios</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.commonRisks.slice(0, 3).map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Typical Controls */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Recommended Controls</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.typicalControls.slice(0, 3).map((control, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-chart-2 mt-0.5">✓</span>
                        <span>{control}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full"
                  onClick={() => createFromTemplateMutation.mutate(template)}
                  disabled={createFromTemplateMutation.isPending}
                  data-testid={`button-use-template-${template.id}`}
                >
                  {createFromTemplateMutation.isPending ? "Creating..." : "Use This Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">About Assessment Templates</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Templates provide a starting point for your security assessments based on industry best practices and ASIS International standards.
          </p>
          <p>
            Each template includes typical asset types, common risk scenarios, and recommended security controls for that facility type. You can customize every aspect of the assessment after creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
