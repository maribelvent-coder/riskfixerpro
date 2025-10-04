import { Link } from "wouter";

export function MarketingFooter() {
  return (
    <footer className="bg-dark-gray text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl mb-4 text-white" data-testid="heading-footer-brand">
              RiskFixer
            </h3>
            <p className="text-sm text-white/80" data-testid="text-tagline">
              Actionable Security Risk Assessments, Simplified.
            </p>
          </div>
          
          <div>
            <h4 className="text-accent-orange font-heading mb-4" data-testid="heading-quick-links">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/signup" data-testid="link-footer-app">
                  <span className="text-white/80 hover:text-white transition-colors">
                    The App
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing" data-testid="link-footer-pricing">
                  <span className="text-white/80 hover:text-white transition-colors">
                    Pricing
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/classes" data-testid="link-footer-classes">
                  <span className="text-white/80 hover:text-white transition-colors">
                    Classes
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-accent-orange font-heading mb-4" data-testid="heading-company">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/consulting" data-testid="link-footer-consulting">
                  <span className="text-white/80 hover:text-white transition-colors">
                    Consulting
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-white/80 hover:text-white transition-colors">
                    Contact
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-accent-orange font-heading mb-4" data-testid="heading-legal">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-white/80 cursor-not-allowed" data-testid="link-privacy">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-white/80 cursor-not-allowed" data-testid="link-terms">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8">
          <p className="text-center text-sm text-white/80" data-testid="text-copyright">
            © 2025 RiskFixer.com. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
