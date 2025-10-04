import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assessmentApi } from "@/lib/api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Shield, FileText } from "lucide-react";
import type { Assessment } from "@shared/schema";

export default function Analytics() {
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: () => assessmentApi.getAll(),
  });

  // Calculate statistics
  const stats = {
    total: assessments.length,
    completed: assessments.filter((a: Assessment) => a.status === "completed").length,
    inProgress: assessments.filter((a: Assessment) => a.status === "in-progress").length,
    draft: assessments.filter((a: Assessment) => a.status === "draft").length,
  };

  // Risk level distribution
  const riskDistribution = [
    { name: "Critical", value: assessments.filter((a: Assessment) => a.riskLevel === "critical").length, color: "#dc2626" },
    { name: "High", value: assessments.filter((a: Assessment) => a.riskLevel === "high").length, color: "#ea580c" },
    { name: "Medium", value: assessments.filter((a: Assessment) => a.riskLevel === "medium").length, color: "#f59e0b" },
    { name: "Low", value: assessments.filter((a: Assessment) => a.riskLevel === "low").length, color: "#16a34a" },
    { name: "Not Assessed", value: assessments.filter((a: Assessment) => !a.riskLevel).length, color: "#6b7280" },
  ].filter(item => item.value > 0);

  // Status distribution for bar chart
  const statusData = [
    { status: "Draft", count: stats.draft },
    { status: "In Progress", count: stats.inProgress },
    { status: "Completed", count: stats.completed },
  ];

  // Recent assessments by month
  const getMonthlyData = () => {
    const monthCounts: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts[key] = 0;
    }

    // Count assessments by month
    assessments.forEach((assessment: Assessment) => {
      if (assessment.createdAt) {
        const date = new Date(assessment.createdAt);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthCounts.hasOwnProperty(key)) {
          monthCounts[key]++;
        }
      }
    });

    return Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
    }));
  };

  const monthlyData = getMonthlyData();

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Risk Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-analytics">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-analytics">
          Risk Analytics
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-analytics-description">
          Comprehensive insights into your security risk assessments
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-assessments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-total">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all sites
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-completion-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-completion-rate">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completed} of {stats.total} completed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-in-progress">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-in-progress">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active assessments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-draft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="metric-draft">{stats.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Not yet started
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card data-testid="card-risk-distribution">
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No risk data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Bar Chart */}
        <Card data-testid="card-status-distribution">
          <CardHeader>
            <CardTitle>Assessment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card data-testid="card-monthly-trend">
        <CardHeader>
          <CardTitle>Assessment Creation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Assessments Created" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Level Breakdown */}
      {riskDistribution.length > 0 && (
        <Card data-testid="card-risk-breakdown">
          <CardHeader>
            <CardTitle>Risk Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((risk) => (
                <div key={risk.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-sm" 
                      style={{ backgroundColor: risk.color }}
                    />
                    <span className="font-medium">{risk.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{risk.value} assessments</Badge>
                    <span className="text-sm text-muted-foreground">
                      {stats.total > 0 ? Math.round((risk.value / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
