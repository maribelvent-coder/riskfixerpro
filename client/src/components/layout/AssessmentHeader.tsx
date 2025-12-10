import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Download, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssessmentHeaderProps {
  assessmentName: string;
  facilityType: string;
  address?: string;
  createdAt: string;
  status: 'draft' | 'in_progress' | 'complete';
  overallRisk?: {
    score: number;
    classification: string;
    color: string;
  };
  onExport?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const RISK_COLORS: Record<string, string> = {
  NEGLIGIBLE: 'bg-green-500',
  LOW: 'bg-blue-500',
  MODERATE: 'bg-yellow-500',
  ELEVATED: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export function AssessmentHeader({
  assessmentName,
  facilityType,
  address,
  createdAt,
  status,
  overallRisk,
  onExport,
  onShare,
  onDelete,
}: AssessmentHeaderProps) {
  const facilityTypeLabels: Record<string, string> = {
    office_building: 'Office Building',
    retail_store: 'Retail Store',
    warehouse: 'Warehouse',
    datacenter: 'Datacenter',
    manufacturing: 'Manufacturing',
    executive_protection: 'Executive Protection',
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{assessmentName}</h1>
            <Badge className={STATUS_COLORS[status]}>
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {facilityTypeLabels[facilityType] || facilityType}
            {address && ` • ${address}`}
            {` • Created: ${new Date(createdAt).toLocaleDateString()}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {overallRisk && (
            <div className={`${RISK_COLORS[overallRisk.classification]} text-white px-4 py-2 rounded-lg`}>
              <div className="text-xs font-medium opacity-90">OVERALL RISK</div>
              <div className="text-lg font-bold">{overallRisk.score}/125 {overallRisk.classification}</div>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-assessment-menu">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport} data-testid="menu-item-export">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare} data-testid="menu-item-share">
                <Share2 className="mr-2 h-4 w-4" />
                Share Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600" data-testid="menu-item-delete">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Assessment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
