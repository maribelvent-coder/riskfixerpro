import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  typeName: string;
  createdAt: string;
  pageCount: number;
  fileSize: string;
  downloadUrl: string;
}

interface ReportHistoryProps {
  reports: Report[];
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => void;
}

export function ReportHistory({ reports, onPreview, onDownload }: ReportHistoryProps) {
  if (reports.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Previously Generated Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              data-testid={`report-${report.id}`}
              className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{report.typeName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {report.pageCount} pages • PDF • {report.fileSize}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(report)}
                    data-testid={`button-preview-${report.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(report)}
                    data-testid={`button-download-${report.id}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
