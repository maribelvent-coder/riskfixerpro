import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";

export default function Consulting() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      
      <main className="flex-1 bg-light-gray-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl mb-6 text-foreground" data-testid="heading-consulting">
            Consulting Services
          </h1>
          <p className="font-sans text-xl text-muted-foreground" data-testid="text-consulting-message">
            Professional services information coming soon
          </p>
        </div>
      </main>
      
      <MarketingFooter />
    </div>
  );
}
