import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Target, AlertTriangle } from "lucide-react";
import type { ThreatLibrary as ThreatLibraryType } from "@shared/schema";
import { THREAT_CATEGORIES, getRiskBadgeClass } from "@shared/libraryConstants";

export default function ThreatLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: threats = [], isLoading } = useQuery<ThreatLibraryType[]>({
    queryKey: ["/api/libraries/threats"],
  });

  const filteredThreats = threats.filter((threat) => {
    const matchesSearch = 
      threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (threat.subcategory && threat.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || threat.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const threatsByCategory = THREAT_CATEGORIES.map(category => ({
    category,
    count: threats.filter(t => t.category === category).length,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="heading-threat-library">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          Threat Library
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
          Comprehensive reference of physical security threats based on ASIS International standards
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card data-testid="card-stat-total-threats" className="p-3 sm:p-6">
          <CardHeader className="p-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Threats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold" data-testid="text-total-threats">{threats.length}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stat-categories" className="p-3 sm:p-6">
          <CardHeader className="p-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold" data-testid="text-categories-count">{THREAT_CATEGORIES.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-high-risk" className="p-3 sm:p-6">
          <CardHeader className="p-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold" data-testid="text-high-risk-count">
              {threats.filter(t => t.typicalLikelihood === "high" || t.typicalLikelihood === "very-high").length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-critical-impact" className="p-3 sm:p-6">
          <CardHeader className="p-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Critical Impact</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold" data-testid="text-critical-impact-count">
              {threats.filter(t => t.typicalImpact === "catastrophic" || t.typicalImpact === "major").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
          <Input
            placeholder="Search threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 text-xs sm:text-sm"
            data-testid="input-search-threats"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[240px] text-xs sm:text-sm" data-testid="select-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="option-category-all">All categories ({threats.length})</SelectItem>
            {threatsByCategory.map(({ category, count }) => (
              <SelectItem key={category} value={category} data-testid={`option-category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                {category} ({count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse p-3 sm:p-6">
              <CardHeader className="p-0 pb-2 sm:pb-3">
                <div className="h-5 sm:h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredThreats.length === 0 ? (
        <Card className="p-3 sm:p-6">
          <CardContent className="py-8 sm:py-12 text-center p-0">
            <Target className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
            <p className="text-muted-foreground text-xs sm:text-sm">
              {searchQuery || selectedCategory !== "all" 
                ? "No threats found matching your criteria" 
                : "No threats available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {filteredThreats.map((threat) => (
            <Card key={threat.id} className="hover-elevate p-3 sm:p-6" data-testid={`card-threat-${threat.id}`}>
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <span className="truncate">{threat.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {threat.category}
                      {threat.subcategory && ` • ${threat.subcategory}`}
                    </CardDescription>
                  </div>
                  {threat.asisCode && (
                    <Badge variant="outline" className="shrink-0 text-[10px] sm:text-xs">
                      {threat.asisCode}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-0">
                <p className="text-xs sm:text-sm">{threat.description}</p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {threat.typicalLikelihood && (
                    <Badge 
                      variant="outline"
                      className={`${getRiskBadgeClass(threat.typicalLikelihood)} text-[10px] sm:text-xs`}
                      data-testid={`badge-likelihood-${threat.typicalLikelihood}`}
                    >
                      Likelihood: {threat.typicalLikelihood.replace("-", " ")}
                    </Badge>
                  )}
                  {threat.typicalImpact && (
                    <Badge 
                      variant="outline"
                      className={`${getRiskBadgeClass(threat.typicalImpact)} text-[10px] sm:text-xs`}
                      data-testid={`badge-impact-${threat.typicalImpact}`}
                    >
                      Impact: {threat.typicalImpact}
                    </Badge>
                  )}
                </div>

                {threat.mitigation && (
                  <div className="pt-2 border-t">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Mitigation Strategy</p>
                    <p className="text-xs sm:text-sm">{threat.mitigation}</p>
                  </div>
                )}

                {threat.examples && threat.examples.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Examples</p>
                    <div className="flex flex-wrap gap-1">
                      {threat.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
