import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { assessmentApi } from "@/lib/api";
import type { Assessment } from "@shared/schema";

export default function Assessments() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: () => assessmentApi.getAll(),
  });

  const filteredAssessments = assessments.filter((assessment: Assessment) => {
    const matchesSearch = 
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-chart-2 text-chart-2-foreground";
      case "in-progress":
        return "bg-chart-3 text-chart-3-foreground";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="page-assessments">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="heading-assessments">
            Assessments
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1" data-testid="text-assessments-description">
            Manage and track all your security risk assessments
          </p>
        </div>
        <Button 
          onClick={() => setLocation("/app/assessments/new")}
          data-testid="button-new-assessment"
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-assessments"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg" data-testid="empty-assessments">
          <div className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" ? (
              <>
                <p className="text-lg font-medium">No assessments found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No assessments yet</p>
                <p className="text-sm mt-1">Create your first assessment to get started</p>
                <Button 
                  onClick={() => setLocation("/app/assessments/new")}
                  className="mt-4"
                  data-testid="button-create-first"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment: Assessment) => (
            <div
              key={assessment.id}
              className="border rounded-md p-4 hover-elevate cursor-pointer transition-all"
              onClick={() => setLocation(`/app/assessments/${assessment.id}`)}
              data-testid={`card-assessment-${assessment.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-title-${assessment.id}`}>
                    {assessment.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-md whitespace-nowrap ${getStatusColor(assessment.status)}`}>
                    {getStatusLabel(assessment.status)}
                  </span>
                </div>
                
                {assessment.location && (
                  <p className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-location-${assessment.id}`}>
                    📍 {assessment.location}
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {assessment.createdAt && (
                    <p>Created: {new Date(assessment.createdAt).toLocaleDateString()}</p>
                  )}
                  {assessment.updatedAt && (
                    <p>Updated: {new Date(assessment.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/app/assessments/${assessment.id}`);
                  }}
                  data-testid={`button-view-${assessment.id}`}
                >
                  View Assessment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
