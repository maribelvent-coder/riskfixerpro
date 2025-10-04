import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const handleStartAssessment = () => {
    if (isAuthenticated) {
      setLocation("/app");
    } else {
      setLocation("/signup");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      
      <main className="flex-1">
        <section className="bg-light-gray-bg py-20" data-testid="section-hero">
          <div className="container mx-auto px-4 text-center">
            <h1 
              className="font-heading text-5xl md:text-6xl mb-6 text-foreground"
              data-testid="heading-hero"
            >
              Actionable Security Risk Assessments, Simplified.
            </h1>
            <p 
              className="font-sans text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              data-testid="text-hero-subtitle"
            >
              Our intuitive software guides you step-by-step from vulnerability discovery to remediation planning.
            </p>
            <Button 
              size="lg"
              className="bg-accent-green hover:bg-accent-green/90 text-white border-accent-green text-lg px-8"
              data-testid="button-start-assessment"
              onClick={handleStartAssessment}
              disabled={isLoading}
            >
              {isAuthenticated ? "Go to Dashboard" : "Start My Assessment"}
            </Button>
          </div>
        </section>

        <section className="py-20" data-testid="section-features">
          <div className="container mx-auto px-4">
            <h2 
              className="font-heading text-4xl text-center mb-12 text-foreground"
              data-testid="heading-features"
            >
              Why RiskFixer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                className="bg-white rounded-md p-8 shadow-md"
                data-testid="card-feature-1"
              >
                <h3 className="font-heading text-2xl mb-4 text-foreground" data-testid="heading-feature-1">
                  Guided Site Assessment
                </h3>
                <p className="font-sans text-muted-foreground" data-testid="text-feature-1">
                  Easily catalog all existing security measures—from barriers and cameras to access control systems—to build a complete security profile of your facility.
                </p>
              </div>
              
              <div 
                className="bg-white rounded-md p-8 shadow-md"
                data-testid="card-feature-2"
              >
                <h3 className="font-heading text-2xl mb-4 text-foreground" data-testid="heading-feature-2">
                  Identify Critical Assets
                </h3>
                <p className="font-sans text-muted-foreground" data-testid="text-feature-2">
                  Pinpoint and rank your most valuable assets, including people, property, and information, to focus your security efforts where they count the most.
                </p>
              </div>
              
              <div 
                className="bg-white rounded-md p-8 shadow-md"
                data-testid="card-feature-3"
              >
                <h3 className="font-heading text-2xl mb-4 text-foreground" data-testid="heading-feature-3">
                  Build a Custom Plan
                </h3>
                <p className="font-sans text-muted-foreground" data-testid="text-feature-3">
                  Our framework gives you control to link critical assets to specific vulnerabilities, helping you build a targeted and effective remediation plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary-blue py-20" data-testid="section-cta">
          <div className="container mx-auto px-4 text-center">
            <h2 
              className="font-heading text-4xl mb-6 text-white"
              data-testid="heading-cta"
            >
              Ready to Take Control of Your Security?
            </h2>
            <p 
              className="font-sans text-xl text-white/90 mb-8 max-w-3xl mx-auto"
              data-testid="text-cta-subtitle"
            >
              See how the RiskFixer app can transform your security planning from a complex chore into a simple, actionable process.
            </p>
            <Button 
              size="lg"
              className="bg-white hover:bg-white/90 text-primary-blue border-white text-lg px-8"
              data-testid="button-see-app"
              onClick={handleStartAssessment}
              disabled={isLoading}
            >
              {isAuthenticated ? "Go to Dashboard" : "See The App in Action"}
            </Button>
          </div>
        </section>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
