import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTypeSelector, ReportType } from './ReportTypeSelector';
import { ReportOptions, ReportOptionsState } from './ReportOptions';
import { ReportHistory } from './ReportHistory';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportsTabProps {
  assessmentId: string;
  hasGeographicData?: boolean;
  hasPhotos?: boolean;
}

export function ReportsTab({
  assessmentId,
  hasGeographicData = false,
  hasPhotos = false,
}: ReportsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ['/api/assessments', assessmentId, 'reports'],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/${assessmentId}/reports`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  const [selectedType, setSelectedType] = useState<ReportType>('full_assessment');
  const [options, setOptions] = useState<ReportOptionsState>({
    includeCoverPage: true,
    includeGeographicData: hasGeographicData,
    includePhotoAppendix: hasPhotos,
    includeCostEstimates: false,
  });
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/assessments/${assessmentId}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedType,
          options,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate report');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Report Generated',
        description: 'Your report is ready for download.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments', assessmentId, 'reports'] });
      
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handlePreview = (report: any) => {
    window.open(`/api/assessments/${assessmentId}/reports/${report.id}/preview`, '_blank');
  };
  
  const handleDownload = (report: any) => {
    window.open(report.downloadUrl, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reports</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate professional PDF reports from your assessment data
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Report Type</h4>
            <ReportTypeSelector
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </div>
          
          <ReportOptions
            options={options}
            onChange={setOptions}
            hasGeographicData={hasGeographicData}
            hasPhotos={hasPhotos}
            hasCostData={false}
          />
          
          <Button
            size="lg"
            className="w-full"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-report"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <ReportHistory
        reports={reports}
        onPreview={handlePreview}
        onDownload={handleDownload}
      />
    </div>
  );
}
