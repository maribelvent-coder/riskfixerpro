import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ReportOptionsState {
  includeCoverPage: boolean;
  includeGeographicData: boolean;
  includePhotoAppendix: boolean;
  includeCostEstimates: boolean;
}

interface ReportOptionsProps {
  options: ReportOptionsState;
  onChange: (options: ReportOptionsState) => void;
  hasGeographicData?: boolean;
  hasPhotos?: boolean;
  hasCostData?: boolean;
}

export function ReportOptions({
  options,
  onChange,
  hasGeographicData = false,
  hasPhotos = false,
  hasCostData = false,
}: ReportOptionsProps) {
  const handleChange = (key: keyof ReportOptionsState, value: boolean) => {
    onChange({ ...options, [key]: value });
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">Include Options</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="coverPage"
            checked={options.includeCoverPage}
            onCheckedChange={(checked) => handleChange('includeCoverPage', !!checked)}
            data-testid="checkbox-cover-page"
          />
          <Label htmlFor="coverPage" className="text-sm text-gray-700 dark:text-gray-300">
            Cover Page with Branding
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="geographicData"
            checked={options.includeGeographicData}
            onCheckedChange={(checked) => handleChange('includeGeographicData', !!checked)}
            disabled={!hasGeographicData}
            data-testid="checkbox-geographic-data"
          />
          <Label
            htmlFor="geographicData"
            className={`text-sm ${hasGeographicData ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
          >
            Geographic Risk Data (CAP Index)
            {!hasGeographicData && ' — No data available'}
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="photoAppendix"
            checked={options.includePhotoAppendix}
            onCheckedChange={(checked) => handleChange('includePhotoAppendix', !!checked)}
            disabled={!hasPhotos}
            data-testid="checkbox-photo-appendix"
          />
          <Label
            htmlFor="photoAppendix"
            className={`text-sm ${hasPhotos ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
          >
            Photo Appendix
            {!hasPhotos && ' — No photos uploaded'}
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <Checkbox
            id="costEstimates"
            checked={options.includeCostEstimates}
            onCheckedChange={(checked) => handleChange('includeCostEstimates', !!checked)}
            disabled={!hasCostData}
            data-testid="checkbox-cost-estimates"
          />
          <Label
            htmlFor="costEstimates"
            className={`text-sm ${hasCostData ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
          >
            Cost Estimates
            {!hasCostData && ' — No estimates available'}
          </Label>
        </div>
      </div>
    </div>
  );
}
