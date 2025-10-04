import { useState } from "react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useLocation } from "wouter";

interface PricingTier {
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  popular?: boolean;
  comingSoon?: boolean;
  cta: {
    text: string;
    action: string;
  };
  features: {
    assessments: string;
    sites: string;
    users: string;
    riskRegister: boolean;
    basicReporting: boolean;
    projectIntegrations: boolean;
    advancedRiskModeling: boolean;
    customizableDashboards: boolean;
    sso: boolean;
    rbac: boolean;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    price: {
      monthly: 29,
      annual: 290, // 2 months free
    },
    cta: {
      text: "Get Started",
      action: "/signup",
    },
    features: {
      assessments: "Up to 5",
      sites: "Up to 2",
      users: "2",
      riskRegister: true,
      basicReporting: true,
      projectIntegrations: false,
      advancedRiskModeling: false,
      customizableDashboards: false,
      sso: false,
      rbac: false,
    },
  },
  {
    name: "Pro",
    price: {
      monthly: 79,
      annual: 790, // 2 months free
    },
    popular: true,
    cta: {
      text: "Start 14-Day Trial",
      action: "/signup",
    },
    features: {
      assessments: "Up to 50",
      sites: "Up to 10",
      users: "10",
      riskRegister: true,
      basicReporting: true,
      projectIntegrations: true,
      advancedRiskModeling: true,
      customizableDashboards: true,
      sso: false,
      rbac: false,
    },
  },
  {
    name: "Enterprise",
    price: {
      monthly: 0,
      annual: 0,
    },
    comingSoon: true,
    cta: {
      text: "Book a Demo",
      action: "/contact",
    },
    features: {
      assessments: "Unlimited",
      sites: "Unlimited",
      users: "Custom",
      riskRegister: true,
      basicReporting: true,
      projectIntegrations: true,
      advancedRiskModeling: true,
      customizableDashboards: true,
      sso: true,
      rbac: true,
    },
  },
];

const featureRows = [
  { label: "Number of Assessments", key: "assessments" as const },
  { label: "Number of Sites", key: "sites" as const },
  { label: "Users Included", key: "users" as const },
  { label: "Risk Register", key: "riskRegister" as const, type: "boolean" },
  { label: "Basic Reporting", key: "basicReporting" as const, type: "boolean" },
  { label: "Project Integrations (Jira, Asana)", key: "projectIntegrations" as const, type: "boolean" },
  { label: "Advanced Risk Modeling", key: "advancedRiskModeling" as const, type: "boolean" },
  { label: "Customizable Dashboards", key: "customizableDashboards" as const, type: "boolean" },
  { label: "Single Sign-On (SSO)", key: "sso" as const, type: "boolean" },
  { label: "Role-Based Access Control", key: "rbac" as const, type: "boolean" },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      
      <main className="flex-1 bg-light-gray-bg py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-5xl mb-4 text-foreground" data-testid="heading-pricing">
              Simple, Transparent Pricing
            </h1>
            <p className="font-sans text-xl text-muted-foreground mb-8" data-testid="text-pricing-subtitle">
              Choose the plan that fits your security assessment needs
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-primary' : 'bg-muted'
                }`}
                data-testid="toggle-billing"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                Annual
                {isAnnual && (
                  <Badge variant="secondary" className="ml-2 bg-accent-green text-white">
                    Save 2 months
                  </Badge>
                )}
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${
                  tier.popular ? 'border-primary border-2 shadow-lg' : ''
                } ${tier.comingSoon ? 'opacity-60' : ''}`}
                data-testid={`card-tier-${tier.name.toLowerCase()}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                {tier.comingSoon && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground">
                    Coming Soon
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  {tier.comingSoon ? (
                    <div className="text-3xl font-bold mb-2">Contact Us</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold mb-2">
                        ${isAnnual ? tier.price.annual : tier.price.monthly}
                        <span className="text-lg font-normal text-muted-foreground">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      </div>
                      {isAnnual && (
                        <CardDescription className="text-sm">
                          ${Math.round(tier.price.annual / 12)}/month billed annually
                        </CardDescription>
                      )}
                    </>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => setLocation(tier.cta.action)}
                    disabled={tier.comingSoon}
                    data-testid={`button-cta-${tier.name.toLowerCase()}`}
                  >
                    {tier.cta.text}
                  </Button>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Core Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span><strong>{tier.features.assessments}</strong> assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span><strong>{tier.features.sites}</strong> sites</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span><strong>{tier.features.users}</strong> users included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Risk Register</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        <span>Basic Reporting</span>
                      </li>
                    </ul>

                    <h4 className="font-semibold text-sm pt-2">Advanced Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        {tier.features.projectIntegrations ? (
                          <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={!tier.features.projectIntegrations ? 'text-muted-foreground' : ''}>
                          Project Integrations
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        {tier.features.advancedRiskModeling ? (
                          <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={!tier.features.advancedRiskModeling ? 'text-muted-foreground' : ''}>
                          Advanced Risk Modeling
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        {tier.features.customizableDashboards ? (
                          <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={!tier.features.customizableDashboards ? 'text-muted-foreground' : ''}>
                          Customizable Dashboards
                        </span>
                      </li>
                    </ul>

                    {tier.name === "Enterprise" && (
                      <>
                        <h4 className="font-semibold text-sm pt-2">Enterprise Grade</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                            <span>Single Sign-On (SSO)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                            <span>Role-Based Access Control</span>
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Compare All Features</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    {pricingTiers.map((tier) => (
                      <th
                        key={tier.name}
                        className={`text-center p-4 font-semibold ${
                          tier.comingSoon ? 'opacity-60' : ''
                        }`}
                      >
                        {tier.name}
                        {tier.popular && (
                          <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                            Popular
                          </Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-muted/30">
                    <td colSpan={4} className="p-3 font-semibold text-sm">
                      Core Features
                    </td>
                  </tr>
                  {featureRows.slice(0, 5).map((row) => (
                    <tr key={row.key} className="border-b hover:bg-muted/20">
                      <td className="p-4">{row.label}</td>
                      {pricingTiers.map((tier) => (
                        <td
                          key={`${tier.name}-${row.key}`}
                          className={`text-center p-4 ${tier.comingSoon ? 'opacity-60' : ''}`}
                        >
                          {row.type === "boolean" ? (
                            tier.features[row.key] ? (
                              <Check className="h-5 w-5 text-chart-2 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground mx-auto" />
                            )
                          ) : (
                            <span className="font-medium">{tier.features[row.key]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  <tr className="border-b bg-muted/30">
                    <td colSpan={4} className="p-3 font-semibold text-sm">
                      Advanced Features
                    </td>
                  </tr>
                  {featureRows.slice(5, 8).map((row) => (
                    <tr key={row.key} className="border-b hover:bg-muted/20">
                      <td className="p-4">{row.label}</td>
                      {pricingTiers.map((tier) => (
                        <td
                          key={`${tier.name}-${row.key}`}
                          className={`text-center p-4 ${tier.comingSoon ? 'opacity-60' : ''}`}
                        >
                          {tier.features[row.key] ? (
                            <Check className="h-5 w-5 text-chart-2 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-b bg-muted/30">
                    <td colSpan={4} className="p-3 font-semibold text-sm">
                      Enterprise Grade
                    </td>
                  </tr>
                  {featureRows.slice(8).map((row) => (
                    <tr key={row.key} className="border-b hover:bg-muted/20">
                      <td className="p-4">{row.label}</td>
                      {pricingTiers.map((tier) => (
                        <td
                          key={`${tier.name}-${row.key}`}
                          className={`text-center p-4 ${tier.comingSoon ? 'opacity-60' : ''}`}
                        >
                          {tier.features[row.key] ? (
                            <Check className="h-5 w-5 text-chart-2 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Need Help Choosing?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <p className="text-muted-foreground">
                  Our team is here to help you find the right plan for your organization's security assessment needs.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/contact")}
                  data-testid="button-contact-sales"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
