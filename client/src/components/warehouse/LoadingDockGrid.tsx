import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Activity, 
  Bell,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";

export interface LoadingDock {
  id: string;
  assessmentId: string;
  dockNumber: string;
  securityScore?: number | null;
  hasCctv: boolean;
  hasMotionSensor?: boolean | null;
  hasAlarm?: boolean | null;
  hasAccessControl?: boolean | null;
  lightingQuality?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoadingDockGridProps {
  loadingDocks: LoadingDock[];
  onDockClick?: (dock: LoadingDock) => void;
}

export function LoadingDockGrid({ loadingDocks, onDockClick }: LoadingDockGridProps) {
  // Get border color based on security score
  const getBorderColor = (score?: number | null): string => {
    if (!score && score !== 0) return 'border-gray-300 dark:border-gray-700';
    
    if (score >= 80) {
      return 'border-green-500';
    } else if (score >= 50) {
      return 'border-yellow-500';
    } else {
      return 'border-red-500';
    }
  };

  // Get badge variant based on security score
  const getScoreBadgeVariant = (score?: number | null): "default" | "secondary" | "destructive" | "outline" => {
    if (!score && score !== 0) return 'outline';
    
    if (score >= 80) {
      return 'default'; // Green
    } else if (score >= 50) {
      return 'secondary'; // Yellow
    } else {
      return 'destructive'; // Red
    }
  };

  // Get status icon based on score
  const getStatusIcon = (score?: number | null) => {
    if (!score && score !== 0) {
      return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
    
    if (score >= 80) {
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    } else if (score >= 50) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
  };

  // Handle dock click
  const handleDockClick = (dock: LoadingDock) => {
    if (onDockClick) {
      onDockClick(dock);
    } else {
      console.log('Clicked dock', dock.id, dock.dockNumber);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loadingDocks.map((dock) => (
        <Card
          key={dock.id}
          className={`border-2 ${getBorderColor(dock.securityScore)} hover-elevate active-elevate-2 cursor-pointer transition-all`}
          onClick={() => handleDockClick(dock)}
          data-testid={`card-dock-${dock.id}`}
        >
          <CardHeader className="pb-3 space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold" data-testid={`text-dock-number-${dock.id}`}>
                {dock.dockNumber}
              </CardTitle>
              {getStatusIcon(dock.securityScore)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Security Score Badge */}
            <div className="flex items-center justify-center">
              <Badge
                variant={getScoreBadgeVariant(dock.securityScore)}
                className="text-lg font-bold px-3 py-1"
                data-testid={`badge-score-${dock.id}`}
              >
                {dock.securityScore !== null && dock.securityScore !== undefined 
                  ? dock.securityScore 
                  : 'N/A'}
              </Badge>
            </div>

            {/* Mini Badges for Security Features */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {/* CCTV Badge */}
              {dock.hasCctv && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                  data-testid={`badge-cctv-${dock.id}`}
                >
                  <Camera className="h-3 w-3" />
                  <span>CCTV</span>
                </div>
              )}

              {/* Motion Sensor Badge */}
              {dock.hasMotionSensor && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium"
                  data-testid={`badge-sensor-${dock.id}`}
                >
                  <Activity className="h-3 w-3" />
                  <span>Sensor</span>
                </div>
              )}

              {/* Alarm Badge */}
              {dock.hasAlarm && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-medium"
                  data-testid={`badge-alarm-${dock.id}`}
                >
                  <Bell className="h-3 w-3" />
                  <span>Alarm</span>
                </div>
              )}
            </div>

            {/* Score Label */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Security Score</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
