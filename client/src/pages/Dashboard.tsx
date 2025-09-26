import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { AssessmentCard } from "@/components/AssessmentCard";
import { Plus, Search, Filter, TrendingUp, Users, Building2, Clock } from "lucide-react";

//todo: remove mock functionality - replace with real data from API
const mockStats = {
  totalAssessments: 24,
  activeAssessments: 8,
  completedThisMonth: 12,
  averageRiskScore: 6.8
};

const mockAssessments = [
  {
    id: "assess-001",
    title: "Corporate Headquarters Security Review",
    location: "123 Business Plaza, Downtown",
    status: "in-progress" as const,
    assessor: "Sarah Johnson",
    createdDate: "Dec 18, 2024",
    lastModified: "Dec 22, 2024",
    riskLevel: "medium" as const
  },
  {
    id: "assess-002", 
    title: "Data Center Physical Security Audit",
    location: "789 Tech Park Drive",
    status: "completed" as const,
    assessor: "Mike Chen",
    createdDate: "Dec 15, 2024",
    lastModified: "Dec 21, 2024",
    riskLevel: "high" as const
  },
  {
    id: "assess-003",
    title: "Warehouse Facility Assessment",
    location: "456 Industrial Way",
    status: "draft" as const,
    assessor: "Alex Rivera",
    createdDate: "Dec 20, 2024",
    lastModified: "Dec 20, 2024"
  }
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNew = () => {
    console.log("Creating new assessment");
  };

  const handleSearch = (query: string) => {
    console.log("Searching assessments:", query);
  };

  const filteredAssessments = mockAssessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-dashboard">Security Assessment Dashboard</h1>
          <p className="text-muted-foreground">
            Manage physical security assessments and risk analysis
          </p>
        </div>
        <Button onClick={handleCreateNew} data-testid="button-create-assessment">
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-total-assessments">
              {mockStats.totalAssessments}
            </div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-active-assessments">
              {mockStats.activeAssessments}
            </div>
            <p className="text-xs text-muted-foreground">
              Across 5 facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-completed-month">
              {mockStats.completedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              +20% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="stat-avg-risk">
              {mockStats.averageRiskScore}/10
            </div>
            <p className="text-xs text-muted-foreground">
              -0.2 improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Risk Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RiskScoreCard
            title="Access Control Systems"
            score={15}
            maxScore={20}
            category="low"
            lastAssessed="2 days ago"
          />
          <RiskScoreCard
            title="Perimeter Security"
            score={12}
            maxScore={20}
            category="medium" 
            lastAssessed="1 week ago"
          />
          <RiskScoreCard
            title="Emergency Preparedness"
            score={8}
            maxScore={20}
            category="high"
            lastAssessed="3 days ago"
          />
          <RiskScoreCard
            title="Physical Barriers"
            score={4}
            maxScore={20}
            category="critical"
            lastAssessed="2 weeks ago"
          />
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Assessments</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-9 w-64"
                data-testid="input-search-assessments"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              {...assessment}
              onStart={(id) => console.log(`Start assessment ${id}`)}
              onView={(id) => console.log(`View assessment ${id}`)}
              onGenerate={(id) => console.log(`Generate report for ${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}