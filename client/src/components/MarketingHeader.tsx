import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/riskfixer-logo-trimmed.png";
import { useAuth } from "@/hooks/useAuth";

export function MarketingHeader() {
  const { isAuthenticated } = useAuth();
  const appLink = isAuthenticated ? "/app/dashboard" : "/signup";

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-8">
        <Link href="/" data-testid="link-home" className="flex-shrink-0 flex items-center">
          <img 
            src={logoPath} 
            alt="RiskFixer Logo" 
            className="h-[17.25rem] w-auto transition-transform hover:scale-105"
            data-testid="img-logo"
          />
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link href={appLink} data-testid="link-app">
            <span className="text-foreground hover:text-primary-blue transition-colors font-sans">
              The App
            </span>
          </Link>
          <Link href="/pricing" data-testid="link-pricing">
            <span className="text-foreground hover:text-primary-blue transition-colors font-sans">
              Pricing
            </span>
          </Link>
          <Link href="/classes" data-testid="link-classes">
            <span className="text-foreground hover:text-primary-blue transition-colors font-sans">
              Classes
            </span>
          </Link>
          <Link href="/consulting" data-testid="link-consulting">
            <span className="text-foreground hover:text-primary-blue transition-colors font-sans">
              Consulting
            </span>
          </Link>
          <Link href="/contact" data-testid="link-contact">
            <span className="text-foreground hover:text-primary-blue transition-colors font-sans">
              Contact
            </span>
          </Link>
          <Link href={appLink} data-testid="link-get-started">
            <Button 
              className="bg-accent-green hover:bg-accent-green/90 text-white border-accent-green"
              data-testid="button-get-started"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
