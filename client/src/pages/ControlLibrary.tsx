import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, Lock, TrendingUp } from "lucide-react";
import type { ControlLibrary as ControlLibraryType } from "@shared/schema";
import { CONTROL_CATEGORIES, getCostBadgeClass } from "@shared/libraryConstants";

export default function ControlLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: controls = [], isLoading } = useQuery<ControlLibraryType[]>({
    queryKey: ["/api/libraries/controls"],
  });

  const filteredControls = controls.filter((control) => {
    const matchesSearch = 
      control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      control.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || control.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const controlsByCategory = CONTROL_CATEGORIES.map(category => ({
    category,
    count: controls.filter(c => c.category === category).length,
  }));

  const avgReduction = controls.length > 0
    ? (controls.reduce((sum, c) => sum + (c.reductionPercentage || 0), 0) / controls.length).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="heading-control-library">
          <ShieldCheck className="w-8 h-8 text-primary" />
          Control Library
        </h1>
        <p className="text-muted-foreground mt-2">
          Professional security control catalog with effectiveness ratings and implementation guidance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-stat-total-controls">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-controls">{controls.length}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-stat-categories">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories-count">{CONTROL_CATEGORIES.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-avg-reduction">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1" data-testid="text-avg-reduction">
              {avgReduction}%
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-low-cost">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-low-cost-count">
              {controls.filter(c => c.estimatedCost === "low").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search controls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-controls"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[240px]" data-testid="select-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="option-category-all">All categories ({controls.length})</SelectItem>
            {controlsByCategory.map(({ category, count }) => (
              <SelectItem key={category} value={category} data-testid={`option-category-${category.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`}>
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
      ) : filteredControls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== "all" 
                ? "No controls found matching your criteria" 
                : "No controls available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredControls.map((control) => (
            <Card key={control.id} className="hover-elevate" data-testid={`card-control-${control.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      {control.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {control.category}
                    </CardDescription>
                  </div>
                  {control.reductionPercentage !== null && control.reductionPercentage !== undefined && (
                    <Badge variant="default" className="shrink-0">
                      -{control.reductionPercentage}% risk
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{control.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {control.controlType && (
                    <Badge 
                      variant="outline"
                      data-testid={`badge-type-${control.controlType}`}
                    >
                      {control.controlType}
                    </Badge>
                  )}
                  {control.estimatedCost && (
                    <Badge 
                      variant="outline"
                      className={getCostBadgeClass(control.estimatedCost)}
                      data-testid={`badge-cost-${control.estimatedCost}`}
                    >
                      Cost: {control.estimatedCost}
                    </Badge>
                  )}
                  {control.maintenanceLevel && (
                    <Badge variant="outline" data-testid={`badge-maintenance-${control.maintenanceLevel}`}>
                      Maintenance: {control.maintenanceLevel}
                    </Badge>
                  )}
                </div>

                {control.implementationNotes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Implementation Notes</p>
                    <p className="text-sm">{control.implementationNotes}</p>
                  </div>
                )}

                <div className="pt-2 border-t flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {control.trainingRequired && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Training:</span> Required
                    </span>
                  )}
                  {control.maintenanceRequired && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">•</span>
                      <span className="font-semibold">Maintenance:</span> Required
                    </span>
                  )}
                  {control.baseWeight !== null && control.baseWeight !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">•</span>
                      <span className="font-semibold">Weight:</span> {control.baseWeight}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
