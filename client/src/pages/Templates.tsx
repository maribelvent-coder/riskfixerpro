import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Search, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentApi, dashboardApi } from "@/lib/api";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  surveyParadigm: "facility" | "executive" | "custom"; // Determines workflow type
  assetTypes: string[];
  commonRisks: string[];
  typicalControls: string[];
}

const templates: Template[] = [
  {
    id: "executive-protection",
    name: "Executive Protection",
    description: "Comprehensive security assessment for high-profile executives covering digital footprint, travel security, residential protection, and corporate office security",
    icon: Shield,
    category: "Executive",
    surveyParadigm: "executive",
    assetTypes: [
      "Executive Personnel",
      "Family Members",
      "Personal Information (PII)",
      "Residential Property",
      "Executive Office Suite",
      "Digital Assets & Credentials",
      "Travel & Transportation",
      "Confidential Communications"
    ],
    commonRisks: [
      "Doxxing & PII Exposure",
      "Social Engineering & Phishing",
      "Surveillance & Pattern-of-Life Analysis",
      "Kidnapping & Extortion",
      "Home Invasion",
      "Travel Ambush",
      "Cyber Compromise (BEC/Account Takeover)",
      "Corporate Espionage",
      "Insider Threats",
      "Active Threats & Violence"
    ],
    typicalControls: [
      "OSINT Assessment & Dark Web Monitoring",
      "Social Media Privacy Controls",
      "Secure Travel Risk Assessments",
      "Residential Perimeter Security (CPTED)",
      "Access Control Systems (Biometric/RBAC)",
      "24/7 CCTV & Intrusion Detection",
      "Safe Room / Panic Room",
      "Executive Protection Detail",
      "Secure Transportation (Vetted Drivers)",
      "TSCM Sweeps (Bug Detection)",
      "VPN & Multi-Factor Authentication",
      "Mail Screening Procedures",
      "Emergency Evacuation Plans",
      "Household Staff Vetting"
    ]
  }
];

export default function Templates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check user tier and assessment count
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const isFreeUser = user?.accountTier === "free";
  const hasReachedFreeLimit = isFreeUser && (stats?.totalAssessments || 0) >= 1;

  const createFromTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      return assessmentApi.create({
        title: `${template.name} - Security Assessment`,
        location: "",
        assessor: "",
        status: "draft",
        templateId: template.id,
        surveyParadigm: template.surveyParadigm
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
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create assessment from template";
      toast({
        title: "Cannot Create Assessment",
        description: errorMessage,
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

      {/* Free Tier Limit Alert */}
      {hasReachedFreeLimit && (
        <Alert variant="destructive" data-testid="alert-free-limit">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Free accounts are limited to 1 assessment. {" "}
            <a href="/pricing" className="underline font-medium">
              Upgrade to Pro or Enterprise
            </a>
            {" "} to create unlimited assessments from templates.
          </AlertDescription>
        </Alert>
      )}

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
                  disabled={createFromTemplateMutation.isPending || hasReachedFreeLimit}
                  data-testid={`button-use-template-${template.id}`}
                >
                  {createFromTemplateMutation.isPending ? "Creating..." : hasReachedFreeLimit ? "Upgrade Required" : "Use This Template"}
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
