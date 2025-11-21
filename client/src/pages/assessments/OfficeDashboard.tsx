import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, AlertTriangle, Users, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Assessment, OfficeProfile } from '@shared/schema';

interface OfficeSafetyScore {
  riskScore: number;
  violenceRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dataRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyVulnerabilities: string[];
}

export default function OfficeDashboard() {
  const { id } = useParams();
  const { toast } = useToast();

  // Local state for form
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [visitorVolume, setVisitorVolume] = useState<string>('');
  const [dataSensitivity, setDataSensitivity] = useState<string>('');
  const [hasExecutivePresence, setHasExecutivePresence] = useState<boolean>(false);

  // Fetch assessment
  const { data: assessment, isLoading: assessmentLoading } = useQuery<Assessment>({
    queryKey: ['/api/assessments', id],
    enabled: !!id
  });

  // Fetch office safety score
  const { data: safetyScore, isLoading: scoreLoading } = useQuery<OfficeSafetyScore>({
    queryKey: [`/api/assessments/${id}/office-safety`],
    enabled: !!id && !!assessment?.office_profile
  });

  // Load profile data when assessment loads
  useEffect(() => {
    if (assessment?.office_profile) {
      const profile = assessment.office_profile;
      setEmployeeCount(profile.employeeCount ?? '');
      setVisitorVolume(profile.visitorVolume ?? '');
      setDataSensitivity(profile.dataSensitivity ?? '');
      setHasExecutivePresence(profile.hasExecutivePresence ?? false);
    } else {
      setEmployeeCount('');
      setVisitorVolume('');
      setDataSensitivity('');
      setHasExecutivePresence(false);
    }
  }, [assessment]);

  const saveMutation = useMutation({
    mutationFn: async (profileData: OfficeProfile) => {
      return await apiRequest('PATCH', `/api/assessments/${id}/office-profile`, {
        office_profile: profileData
      });
    },
    onSuccess: (response: any) => {
      // Immediately update local state from response
      if (response?.office_profile) {
        const profile = response.office_profile;
        setEmployeeCount(profile.employeeCount ?? '');
        setVisitorVolume(profile.visitorVolume ?? '');
        setDataSensitivity(profile.dataSensitivity ?? '');
        setHasExecutivePresence(profile.hasExecutivePresence ?? false);
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

  const handleSaveAndAnalyze = () => {
    const profileData: OfficeProfile = {
      employeeCount: employeeCount as any || undefined,
      visitorVolume: visitorVolume as any || undefined,
      dataSensitivity: dataSensitivity as any || undefined,
      hasExecutivePresence: hasExecutivePresence || undefined
    };

    saveMutation.mutate(profileData);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-600 dark:text-red-400';
      case 'High': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Corporate Operations</h2>
        <p className="text-muted-foreground">Workplace violence preparedness and data security analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Office Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Office Profile</CardTitle>
            <CardDescription>Configure facility characteristics for risk analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-count" data-testid="label-employee-count">Employee Count</Label>
              <Select value={employeeCount} onValueChange={setEmployeeCount}>
                <SelectTrigger id="employee-count" data-testid="select-employee-count">
                  <SelectValue placeholder="Select employee count range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-50">1-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1,000 employees</SelectItem>
                  <SelectItem value="1000+">1,000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitor-volume" data-testid="label-visitor-volume">Visitor Volume</Label>
              <Select value={visitorVolume} onValueChange={setVisitorVolume}>
                <SelectTrigger id="visitor-volume" data-testid="select-visitor-volume">
                  <SelectValue placeholder="Select visitor traffic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{'Low (< 10/day)'}</SelectItem>
                  <SelectItem value="Medium">Medium (10-50/day)</SelectItem>
                  <SelectItem value="High">{'High (> 50/day)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-sensitivity" data-testid="label-data-sensitivity">Data Sensitivity</Label>
              <Select value={dataSensitivity} onValueChange={setDataSensitivity}>
                <SelectTrigger id="data-sensitivity" data-testid="select-data-sensitivity">
                  <SelectValue placeholder="Select data classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Internal">Internal Use Only</SelectItem>
                  <SelectItem value="Confidential">Confidential</SelectItem>
                  <SelectItem value="Restricted">Restricted/Trade Secrets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="executive-presence" 
                checked={hasExecutivePresence}
                onCheckedChange={(checked) => setHasExecutivePresence(checked as boolean)}
                data-testid="checkbox-executive-presence"
              />
              <Label 
                htmlFor="executive-presence" 
                className="text-sm font-normal cursor-pointer"
                data-testid="label-executive-presence"
              >
                High-profile executive presence
              </Label>
            </div>

            <Button 
              onClick={handleSaveAndAnalyze} 
              disabled={saveMutation.isPending}
              className="w-full"
              data-testid="button-save-analyze"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save & Analyze'}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Safety & Security Metrics */}
        <div className="space-y-6">
          {/* Overall Risk Score */}
          {safetyScore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Overall Safety Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold" data-testid="text-overall-score">
                    {safetyScore.riskScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Risk Score (0-100)</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workplace Violence Risk */}
          {safetyScore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Workplace Violence Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Risk Level</span>
                  <Badge variant={getRiskLevelBadgeVariant(safetyScore.violenceRiskLevel)} data-testid="badge-violence-risk">
                    {safetyScore.violenceRiskLevel}
                  </Badge>
                </div>
                <div className="flex h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      safetyScore.violenceRiskLevel === 'Critical' ? 'bg-red-600' :
                      safetyScore.violenceRiskLevel === 'High' ? 'bg-orange-600' :
                      safetyScore.violenceRiskLevel === 'Medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((safetyScore.riskScore * 0.6), 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Security Risk */}
          {safetyScore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Security Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Risk Level</span>
                  <Badge variant={getRiskLevelBadgeVariant(safetyScore.dataRiskLevel)} data-testid="badge-data-risk">
                    {safetyScore.dataRiskLevel}
                  </Badge>
                </div>
                <div className="flex h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      safetyScore.dataRiskLevel === 'Critical' ? 'bg-red-600' :
                      safetyScore.dataRiskLevel === 'High' ? 'bg-orange-600' :
                      safetyScore.dataRiskLevel === 'Medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((safetyScore.riskScore * 0.4), 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Vulnerabilities */}
          {safetyScore && safetyScore.keyVulnerabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Key Vulnerabilities
                </CardTitle>
                <CardDescription>{safetyScore.keyVulnerabilities.length} items require attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-vulnerabilities">
                  {safetyScore.keyVulnerabilities.slice(0, 8).map((vuln, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{vuln}</span>
                    </li>
                  ))}
                </ul>
                {safetyScore.keyVulnerabilities.length > 8 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    + {safetyScore.keyVulnerabilities.length - 8} more vulnerabilities
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!safetyScore && !scoreLoading && assessment?.office_profile && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete the facility survey to generate safety analysis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
