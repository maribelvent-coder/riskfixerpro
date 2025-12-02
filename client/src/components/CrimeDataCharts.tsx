import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { CrimeObservation, CrimeSource } from "@shared/schema";

interface CrimeBreakdown {
  total: number;
  rate_per_100k: number;
  breakdown?: {
    [key: string]: number;
  };
}

interface CrimeDataChartsProps {
  observations: CrimeObservation[];
  source?: CrimeSource;
}

const COLORS = {
  violent: "hsl(var(--destructive))",
  property: "hsl(var(--chart-2))",
  breakdown: [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ],
};

function parseJsonField(field: unknown): CrimeBreakdown | null {
  let obj: any = null;
  
  // Handle already-parsed objects
  if (typeof field === 'object' && field !== null && 'total' in field) {
    obj = field;
  }
  // Parse JSON strings
  else if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (parsed && typeof parsed === 'object' && 'total' in parsed) {
        obj = parsed;
      }
    } catch {
      // Invalid JSON
      return null;
    }
  }
  
  if (!obj) {
    return null;
  }
  
  // Normalize numeric fields (handle legacy string numbers)
  const coerceToNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  
  const normalized: CrimeBreakdown = {
    total: coerceToNumber(obj.total),
    rate_per_100k: coerceToNumber(obj.rate_per_100k),
    breakdown: {},
  };
  
  // Normalize breakdown fields if present
  if (obj.breakdown && typeof obj.breakdown === 'object') {
    for (const [key, value] of Object.entries(obj.breakdown)) {
      normalized.breakdown![key] = coerceToNumber(value);
    }
  }
  
  return normalized;
}

const EMPTY_CRIME_DATA: CrimeBreakdown = {
  total: 0,
  rate_per_100k: 0,
  breakdown: {},
};

export function CrimeDataCharts({ observations, source }: CrimeDataChartsProps) {
  if (!observations || observations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No crime data available for visualization.</p>
      </div>
    );
  }

  const latestObservation = observations[0];
  const parsedViolent = parseJsonField(latestObservation.violentCrimes);
  const parsedProperty = parseJsonField(latestObservation.propertyCrimes);

  // Show error state if neither dataset is available
  if (!parsedViolent && !parsedProperty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Crime data could not be parsed for visualization.</p>
        <p className="text-xs mt-2">The crime data may be in an unsupported format.</p>
      </div>
    );
  }

  // Track which datasets are actually available
  const hasViolent = !!parsedViolent;
  const hasProperty = !!parsedProperty;
  const hasPartialData = !hasViolent || !hasProperty;

  // Use parsed data or empty fallback
  const violentCrimes = parsedViolent || EMPTY_CRIME_DATA;
  const propertyCrimes = parsedProperty || EMPTY_CRIME_DATA;

  // Violent vs Property comparison (only include available datasets)
  const categoryData = [];
  if (hasViolent) {
    categoryData.push({
      name: "Violent Crimes",
      count: violentCrimes.total,
      rate: violentCrimes.rate_per_100k,
    });
  }
  if (hasProperty) {
    categoryData.push({
      name: "Property Crimes",
      count: propertyCrimes.total,
      rate: propertyCrimes.rate_per_100k,
    });
  }

  // Pie chart data for crime category distribution (only include available datasets)
  const pieData = [];
  if (hasViolent) {
    pieData.push({ name: "Violent", value: violentCrimes.total, color: COLORS.violent });
  }
  if (hasProperty) {
    pieData.push({ name: "Property", value: propertyCrimes.total, color: COLORS.property });
  }

  // Breakdown data for violent crimes
  const violentBreakdownData = violentCrimes.breakdown
    ? Object.entries(violentCrimes.breakdown)
        .filter(([_, value]) => value && value > 0)
        .map(([key, value]) => ({
          name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          count: value,
        }))
    : [];

  // Breakdown data for property crimes
  const propertyBreakdownData = propertyCrimes.breakdown
    ? Object.entries(propertyCrimes.breakdown)
        .filter(([_, value]) => value && value > 0)
        .map(([key, value]) => ({
          name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          count: value,
        }))
    : [];

  // Multi-year trend data (if multiple observations exist)
  const hasTrendData = observations.length > 1;
  const trendData = hasTrendData
    ? observations
        .slice()
        .reverse()
        .map((obs, index) => {
          const violent = parseJsonField(obs.violentCrimes);
          const property = parseJsonField(obs.propertyCrimes);
          
          // Derive period from observation dates or fall back to source period or index
          let period = source?.dataTimePeriod || `Period ${index + 1}`;
          
          // Try to extract year from dates (handle both Date objects and ISO strings)
          if (obs.startDate) {
            try {
              const date = typeof obs.startDate === 'string' ? new Date(obs.startDate) : obs.startDate;
              if (!isNaN(date.getTime())) {
                period = date.getFullYear().toString();
              }
            } catch {
              // Invalid date, use fallback
            }
          } else if (obs.createdAt) {
            try {
              const date = typeof obs.createdAt === 'string' ? new Date(obs.createdAt) : obs.createdAt;
              if (!isNaN(date.getTime())) {
                period = date.getFullYear().toString();
              }
            } catch {
              // Invalid date, use fallback
            }
          }
          
          // Only include datasets that are actually available (don't show zeros for missing data)
          const dataPoint: any = { period };
          if (violent) {
            dataPoint.violent = violent.total;
          }
          if (property) {
            dataPoint.property = property.total;
          }
          // Only calculate total if we have both categories
          if (violent && property) {
            dataPoint.total = violent.total + property.total;
          }
          
          return dataPoint;
        })
    : [];

  const hasRates = violentCrimes.rate_per_100k > 0 || propertyCrimes.rate_per_100k > 0;

  return (
    <div className="space-y-4">
      {hasPartialData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Partial Data:</strong> {hasViolent && !hasProperty && "Only violent crime data is available. Property crime data is missing."}
            {!hasViolent && hasProperty && "Only property crime data is available. Violent crime data is missing."}
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown - Pie Chart */}
        {pieData.length > 0 && (
          <Card data-testid="card-crime-category-pie">
            <CardHeader>
              <CardTitle>Crime Category Distribution</CardTitle>
              <CardDescription>
                Violent vs. property crime breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-sm">
                {hasViolent && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.violent }} />
                      <span>Violent Crimes</span>
                    </div>
                    <span className="font-medium">{violentCrimes.total.toLocaleString()}</span>
                  </div>
                )}
                {hasProperty && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS.property }} />
                      <span>Property Crimes</span>
                    </div>
                    <span className="font-medium">{propertyCrimes.total.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Crimes Comparison */}
        {categoryData.length > 0 && (
          <Card data-testid="card-crime-totals-bar">
            <CardHeader>
              <CardTitle>Crime Totals</CardTitle>
              <CardDescription>
                {hasRates ? "Total incidents and rates per 100k population" : "Total incidents"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Total Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Crime Rates (if available) */}
      {hasRates && (
        <Card data-testid="card-crime-rates">
          <CardHeader>
            <CardTitle>Crime Rates per 100,000 Population</CardTitle>
            <CardDescription>
              Standardized crime rates for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="rate" fill="hsl(var(--chart-3))" name="Rate per 100k" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Violent Crime Breakdown */}
      {violentBreakdownData.length > 0 && (
        <Card data-testid="card-violent-breakdown">
          <CardHeader>
            <CardTitle>Violent Crime Breakdown</CardTitle>
            <CardDescription>
              Types of violent crimes reported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={violentBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.violent} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Property Crime Breakdown */}
      {propertyBreakdownData.length > 0 && (
        <Card data-testid="card-property-breakdown">
          <CardHeader>
            <CardTitle>Property Crime Breakdown</CardTitle>
            <CardDescription>
              Types of property crimes reported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={propertyBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.property} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Multi-Year Trend (if available) */}
      {hasTrendData && trendData.length > 1 && (
        <Card data-testid="card-crime-trend">
          <CardHeader>
            <CardTitle>Crime Trends Over Time</CardTitle>
            <CardDescription>
              Historical crime data comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {hasViolent && (
                  <Line
                    type="monotone"
                    dataKey="violent"
                    stroke={COLORS.violent}
                    name="Violent Crimes"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
                {hasProperty && (
                  <Line
                    type="monotone"
                    dataKey="property"
                    stroke={COLORS.property}
                    name="Property Crimes"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
