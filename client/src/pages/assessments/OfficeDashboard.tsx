import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Shield, AlertTriangle, Users, Database, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoGenerateRisks } from '@/hooks/useAutoGenerateRisks';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { officeProfileSchema } from '@shared/schema';
import type { Assessment, OfficeProfile } from '@shared/schema';
import { RiskAssessmentNBS } from '@/components/RiskAssessmentNBS';
import { ExecutiveSummaryCard } from '@/components/analysis/ExecutiveSummaryCard';

interface OfficeSafetyScore {
  riskScore: number;
  violenceRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dataRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyVulnerabilities: string[];
}

export default function OfficeDashboard() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Initialize form with zodResolver and default values
  const form = useForm<OfficeProfile>({
    resolver: zodResolver(officeProfileSchema),
    defaultValues: {
      employeeCount: undefined,
      visitorVolume: undefined,
      dataSensitivity: undefined,
      hasExecutivePresence: false,
      // TCOR fields
      annualTurnoverRate: undefined,
      avgHiringCost: undefined,
      annualLiabilityEstimates: undefined,
      securityIncidentsPerYear: undefined,
      brandDamageEstimate: undefined,
    },
  });

  // Fetch assessment
  const { data: assessment, isLoading: assessmentLoading } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${id}`],
    enabled: !!id
  });

  // Fetch office safety score
  const { data: safetyScore, isLoading: scoreLoading } = useQuery<OfficeSafetyScore>({
    queryKey: [`/api/assessments/${id}/office-safety`],
    enabled: !!id && !!assessment?.office_profile
  });

  // Auto-generate risk scenarios when profile is saved (hybrid model - backend handles generation)
  const profileSaved = !!assessment?.office_profile;
  const { scenariosExist } = useAutoGenerateRisks(id, profileSaved);

  // Load profile data when assessment loads
  useEffect(() => {
    if (assessment?.office_profile) {
      const profile = assessment.office_profile as OfficeProfile;
      form.reset({
        employeeCount: profile.employeeCount,
        visitorVolume: profile.visitorVolume,
        dataSensitivity: profile.dataSensitivity,
        hasExecutivePresence: profile.hasExecutivePresence ?? false,
        // TCOR fields
        annualTurnoverRate: profile.annualTurnoverRate,
        avgHiringCost: profile.avgHiringCost,
        annualLiabilityEstimates: profile.annualLiabilityEstimates,
        securityIncidentsPerYear: profile.securityIncidentsPerYear,
        brandDamageEstimate: profile.brandDamageEstimate,
      });
    } else {
      // Reset to defaults when no profile
      form.reset({
        employeeCount: undefined,
        visitorVolume: undefined,
        dataSensitivity: undefined,
        hasExecutivePresence: false,
        // TCOR fields
        annualTurnoverRate: undefined,
        avgHiringCost: undefined,
        annualLiabilityEstimates: undefined,
        securityIncidentsPerYear: undefined,
        brandDamageEstimate: undefined,
      });
    }
  }, [assessment, form]);

  const saveMutation = useMutation({
    mutationFn: async (profileData: OfficeProfile) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/office-profile`, {
        office_profile: profileData
      });
    },
    onSuccess: (response: any) => {
      // Immediately update form state from response
      if (response?.office_profile) {
        const profile = response.office_profile as OfficeProfile;
        form.reset({
          employeeCount: profile.employeeCount,
          visitorVolume: profile.visitorVolume,
          dataSensitivity: profile.dataSensitivity,
          hasExecutivePresence: profile.hasExecutivePresence ?? false,
          // TCOR fields
          annualTurnoverRate: profile.annualTurnoverRate,
          avgHiringCost: profile.avgHiringCost,
          annualLiabilityEstimates: profile.annualLiabilityEstimates,
          securityIncidentsPerYear: profile.securityIncidentsPerYear,
          brandDamageEstimate: profile.brandDamageEstimate,
        });
      }
      
      // Then invalidate queries for background refetch
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${id}/office-safety`] });
      toast({
        title: 'Profile Saved',
        description: 'Office profile updated successfully'
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to update office profile';
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: OfficeProfile) => {
    saveMutation.mutate(data);
  };

  const getRiskLevelBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  if (assessmentLoading) {
    return (
      <div className="p-6" data-testid="loading-state">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6" data-testid="office-dashboard">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold" data-testid="heading-title">Corporate Operations</h2>
        <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-subtitle">
          Workplace violence preparedness and data security analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="horizontal-scroll-container pb-1">
          <TabsList data-testid="tabs-list" className="inline-flex gap-1 p-1 w-max min-w-full">
            <TabsTrigger value="profile" data-testid="tab-profile" className="text-xs sm:text-sm whitespace-nowrap">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile & Safety Score</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="risk-assessment" data-testid="tab-risk-assessment" className="text-xs sm:text-sm whitespace-nowrap">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Risk Assessment</span>
              <span className="sm:hidden">Risks</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-4 sm:mt-5 md:mt-6">
        {/* Security Risk Cards - TOP PRIORITY */}
        {safetyScore && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-5 md:mb-6">
            {/* Workplace Violence Risk */}
            <Card data-testid="card-violence-risk">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-violence-risk">
                  <Users className="w-5 h-5" />
                  Workplace Violence Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium" data-testid="text-violence-label">Risk Level</span>
                  <Badge 
                    variant={getRiskLevelBadgeVariant(safetyScore.violenceRiskLevel)} 
                    data-testid="badge-violence-risk"
                  >
                    {safetyScore.violenceRiskLevel}
                  </Badge>
                </div>
                <div className="flex h-3 w-full rounded-full bg-muted overflow-hidden" data-testid="meter-violence-risk">
                  <div 
                    className={`h-full transition-all ${
                      safetyScore.violenceRiskLevel === 'Critical' ? 'bg-red-600' :
                      safetyScore.violenceRiskLevel === 'High' ? 'bg-orange-600' :
                      safetyScore.violenceRiskLevel === 'Medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((safetyScore.riskScore * 0.6), 100)}%` }}
                    data-testid="meter-violence-fill"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Security Risk */}
            <Card data-testid="card-data-risk">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-data-risk">
                  <Database className="w-5 h-5" />
                  Data Security Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium" data-testid="text-data-label">Risk Level</span>
                  <Badge 
                    variant={getRiskLevelBadgeVariant(safetyScore.dataRiskLevel)} 
                    data-testid="badge-data-risk"
                  >
                    {safetyScore.dataRiskLevel}
                  </Badge>
                </div>
                <div className="flex h-3 w-full rounded-full bg-muted overflow-hidden" data-testid="meter-data-risk">
                  <div 
                    className={`h-full transition-all ${
                      safetyScore.dataRiskLevel === 'Critical' ? 'bg-red-600' :
                      safetyScore.dataRiskLevel === 'High' ? 'bg-orange-600' :
                      safetyScore.dataRiskLevel === 'Medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((safetyScore.riskScore * 0.4), 100)}%` }}
                    data-testid="meter-data-fill"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Office Profile Form */}
          <Card data-testid="card-profile-form">
            <CardHeader>
              <CardTitle data-testid="heading-form-title">Office Profile</CardTitle>
              <CardDescription data-testid="text-form-description">
                Configure facility characteristics for risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Employee Count */}
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-employee-count">Employee Count</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-employee-count">
                            <SelectValue placeholder="Select employee count range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-50" data-testid="option-employees-1-50">1-50 employees</SelectItem>
                          <SelectItem value="51-200" data-testid="option-employees-51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-1000" data-testid="option-employees-201-1000">201-1,000 employees</SelectItem>
                          <SelectItem value="1000+" data-testid="option-employees-1000-plus">1,000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage data-testid="error-employee-count" />
                    </FormItem>
                  )}
                />

                {/* Visitor Volume */}
                <FormField
                  control={form.control}
                  name="visitorVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-visitor-volume">Visitor Volume</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-visitor-volume">
                            <SelectValue placeholder="Select visitor traffic level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low" data-testid="option-visitor-low">{'Low (< 10/day)'}</SelectItem>
                          <SelectItem value="Medium" data-testid="option-visitor-medium">Medium (10-50/day)</SelectItem>
                          <SelectItem value="High" data-testid="option-visitor-high">{'High (> 50/day)'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage data-testid="error-visitor-volume" />
                    </FormItem>
                  )}
                />

                {/* Data Sensitivity */}
                <FormField
                  control={form.control}
                  name="dataSensitivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-data-sensitivity">Data Sensitivity</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-data-sensitivity">
                            <SelectValue placeholder="Select data classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Public" data-testid="option-data-public">Public</SelectItem>
                          <SelectItem value="Internal" data-testid="option-data-internal">Internal Use Only</SelectItem>
                          <SelectItem value="Confidential" data-testid="option-data-confidential">Confidential</SelectItem>
                          <SelectItem value="Restricted" data-testid="option-data-restricted">Restricted/Trade Secrets</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage data-testid="error-data-sensitivity" />
                    </FormItem>
                  )}
                />

                {/* Executive Presence */}
                <FormField
                  control={form.control}
                  name="hasExecutivePresence"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-executive-presence"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel data-testid="label-executive-presence">
                          High-profile executive presence
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {/* TCOR Section */}
                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">Total Cost of Risk (TCOR) Factors</h3>
                    <p className="text-xs text-muted-foreground">
                      Optional: Add indirect cost factors to calculate comprehensive annual risk exposure
                    </p>
                  </div>

                  {/* Annual Turnover Rate */}
                  <FormField
                    control={form.control}
                    name="annualTurnoverRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-annual-turnover-rate">Annual Turnover Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 30"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-annual-turnover-rate"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-annual-turnover-rate" />
                      </FormItem>
                    )}
                  />

                  {/* Average Hiring Cost */}
                  <FormField
                    control={form.control}
                    name="avgHiringCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-avg-hiring-cost">Avg Hiring Cost ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 8000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-avg-hiring-cost"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-avg-hiring-cost" />
                      </FormItem>
                    )}
                  />

                  {/* Annual Liability Estimates */}
                  <FormField
                    control={form.control}
                    name="annualLiabilityEstimates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-annual-liability-estimates">Annual Liability/Insurance ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 25000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-annual-liability-estimates"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-annual-liability-estimates" />
                      </FormItem>
                    )}
                  />

                  {/* Security Incidents Per Year */}
                  <FormField
                    control={form.control}
                    name="securityIncidentsPerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-security-incidents-per-year">Security Incidents/Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-security-incidents-per-year"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-security-incidents-per-year" />
                      </FormItem>
                    )}
                  />

                  {/* Brand Damage Estimate */}
                  <FormField
                    control={form.control}
                    name="brandDamageEstimate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel data-testid="label-brand-damage-estimate">Brand/Reputation Cost ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 50000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-brand-damage-estimate"
                          />
                        </FormControl>
                        <FormMessage data-testid="error-brand-damage-estimate" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full"
                  data-testid="button-save-analyze"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save & Analyze'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

          {/* Right Column: Overall Score & Vulnerabilities */}
          <div className="space-y-6">
            {/* Overall Risk Score */}
            {safetyScore && (
              <Card data-testid="card-overall-score">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="heading-overall-score">
                    <Shield className="w-5 h-5" />
                    Overall Security Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-bold" data-testid="text-overall-score">
                      {safetyScore.riskScore}
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-score-label">
                      Risk Score (0-100, higher = more risk)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Vulnerabilities */}
          {safetyScore && safetyScore.keyVulnerabilities.length > 0 && (
            <Card data-testid="card-vulnerabilities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="heading-vulnerabilities">
                  <AlertTriangle className="w-5 h-5" />
                  Key Vulnerabilities
                </CardTitle>
                <CardDescription data-testid="text-vulnerability-count">
                  {safetyScore.keyVulnerabilities.length} items require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-vulnerabilities">
                  {safetyScore.keyVulnerabilities.slice(0, 8).map((vuln, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm" data-testid={`item-vulnerability-${index}`}>
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{vuln}</span>
                    </li>
                  ))}
                </ul>
                {safetyScore.keyVulnerabilities.length > 8 && (
                  <p className="text-sm text-muted-foreground mt-4" data-testid="text-more-vulnerabilities">
                    + {safetyScore.keyVulnerabilities.length - 8} more vulnerabilities
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!safetyScore && !scoreLoading && assessment?.office_profile && (
            <Card data-testid="card-no-score">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p data-testid="text-no-score-message">
                    Complete the facility survey to generate safety analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </TabsContent>

      <TabsContent value="risk-assessment" className="mt-6">
        {id && <RiskAssessmentNBS assessmentId={id} />}
      </TabsContent>
    </Tabs>

    {/* AI Executive Summary - Always visible */}
    {id && (
      <div className="mt-6">
        <ExecutiveSummaryCard 
          assessmentId={id} 
          executiveSummary={assessment?.executiveSummary}
        />
      </div>
    )}
    </div>
  );
}
