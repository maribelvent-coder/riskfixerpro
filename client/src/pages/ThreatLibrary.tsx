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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="heading-threat-library">
          <Shield className="w-8 h-8 text-primary" />
          Threat Library
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive reference of physical security threats based on ASIS International standards
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-stat-total-threats">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-threats">{threats.length}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stat-categories">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories-count">{THREAT_CATEGORIES.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-high-risk">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-high-risk-count">
              {threats.filter(t => t.typicalLikelihood === "high" || t.typicalLikelihood === "very-high").length}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-critical-impact">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-critical-impact-count">
              {threats.filter(t => t.typicalImpact === "catastrophic" || t.typicalImpact === "major").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-threats"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[240px]" data-testid="select-category">
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
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredThreats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all" 
                ? "No threats found matching your criteria" 
                : "No threats available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredThreats.map((threat) => (
            <Card key={threat.id} className="hover-elevate" data-testid={`card-threat-${threat.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      {threat.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {threat.category}
                      {threat.subcategory && ` • ${threat.subcategory}`}
                    </CardDescription>
                  </div>
                  {threat.asisCode && (
                    <Badge variant="outline" className="shrink-0">
                      {threat.asisCode}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{threat.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {threat.typicalLikelihood && (
                    <Badge 
                      variant="outline"
                      className={getRiskBadgeClass(threat.typicalLikelihood)}
                      data-testid={`badge-likelihood-${threat.typicalLikelihood}`}
                    >
                      Likelihood: {threat.typicalLikelihood.replace("-", " ")}
                    </Badge>
                  )}
                  {threat.typicalImpact && (
                    <Badge 
                      variant="outline"
                      className={getRiskBadgeClass(threat.typicalImpact)}
                      data-testid={`badge-impact-${threat.typicalImpact}`}
                    >
                      Impact: {threat.typicalImpact}
                    </Badge>
                  )}
                </div>

                {threat.mitigation && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Mitigation Strategy</p>
                    <p className="text-sm">{threat.mitigation}</p>
                  </div>
                )}

                {threat.examples && threat.examples.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Examples</p>
                    <div className="flex flex-wrap gap-1">
                      {threat.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
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
