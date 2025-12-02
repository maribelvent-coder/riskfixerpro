import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IncidentImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
}

export function IncidentImportDialog({
  open,
  onOpenChange,
  siteId,
}: IncidentImportDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    imported: number;
    errors?: string[];
  } | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/sites/${siteId}/incidents/import-csv`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(error.error || "Failed to upload CSV");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/sites", siteId, "incidents"] });
      toast({
        title: "Import successful",
        description: `Imported ${data.imported} incident${data.imported !== 1 ? 's' : ''}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message,
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Site Incidents</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing site incident records. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="csv-upload"
              className="block text-sm font-medium mb-2"
            >
              Select CSV File
            </label>
            <div className="flex gap-2">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                data-testid="input-csv-file"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
            <h4 className="font-medium text-sm">CSV Format Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li><strong>Date</strong> - Incident date (e.g., 2024-01-15)</li>
              <li><strong>Type</strong> - Incident type: theft, vandalism, break_in, trespassing, assault, fire, accident, other</li>
              <li><strong>Description</strong> - Brief description of the incident (required)</li>
              <li><strong>Severity</strong> - low, medium, high, or critical</li>
              <li><strong>Location</strong> - Location within site (optional)</li>
              <li><strong>Police Notified</strong> - yes or no</li>
              <li><strong>Police Report #</strong> - Police report number (optional)</li>
              <li><strong>Estimated Cost</strong> - Estimated cost in dollars (optional)</li>
              <li><strong>Notes</strong> - Additional notes (optional)</li>
            </ul>
          </div>

          {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Some rows had errors:</div>
                <ul className="text-sm space-y-1 ml-4 list-disc max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <li className="text-muted-foreground">
                      ...and {uploadResult.errors.length - 10} more errors
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {uploadResult && uploadResult.imported > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Successfully imported {uploadResult.imported} incident
                {uploadResult.imported !== 1 ? 's' : ''}.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} data-testid="button-cancel-import">
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                data-testid="button-confirm-import"
              >
                {uploadMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
