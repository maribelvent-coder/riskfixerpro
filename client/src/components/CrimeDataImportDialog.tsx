import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CrimeDataImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId?: string;
  assessmentId?: string;
}

const manualEntrySchema = z.object({
  dataTimePeriod: z.string().min(1, "Time period is required"),
  violentTotal: z.coerce.number().positive("Must be a positive number"),
  propertyTotal: z.coerce.number().positive("Must be a positive number"),
  population: z.coerce.number().positive("Must be a positive number"),
  city: z.string().optional(),
  county: z.string().optional(),
  state: z.string().optional(),
});

type ManualEntryForm = z.infer<typeof manualEntrySchema>;

export function CrimeDataImportDialog({ open, onOpenChange, siteId, assessmentId }: CrimeDataImportDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // PDF Upload Mutation
  const pdfUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (siteId) formData.append("siteId", siteId);
      if (assessmentId) formData.append("assessmentId", assessmentId);

      const response = await fetch("/api/crime-data/import-pdf", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to upload PDF" }));
        throw new Error(error.error || "Failed to upload PDF");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crime data imported",
        description: "PDF processed successfully and crime data added.",
      });
      // Invalidate crime sources for both site and assessment contexts
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", siteId] });
      }
      if (assessmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", assessmentId] });
      }
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manual Entry Form
  const form = useForm<ManualEntryForm>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      dataTimePeriod: "",
      violentTotal: 0,
      propertyTotal: 0,
      population: 0,
      city: "",
      county: "",
      state: "",
    },
  });

  // Manual Entry Mutation
  const manualEntryMutation = useMutation({
    mutationFn: async (data: ManualEntryForm) => {
      const response = await apiRequest("POST", "/api/crime-data/manual-entry", {
        ...data,
        siteId,
        assessmentId,
      });
      return response.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      toast({
        title: "Crime data saved",
        description: "Manual entry saved successfully.",
      });
      // Invalidate crime sources for both site and assessment contexts
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", siteId] });
      }
      if (assessmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", assessmentId] });
      }
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(f => f.type === "application/pdf");

    if (pdfFile) {
      setSelectedFile(pdfFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handlePdfUpload = () => {
    if (selectedFile) {
      pdfUploadMutation.mutate(selectedFile);
    }
  };

  const onManualSubmit = (data: ManualEntryForm) => {
    manualEntryMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-crime-import">
        <DialogHeader>
          <DialogTitle>Import Crime Data</DialogTitle>
          <DialogDescription>
            Upload a CAP Index PDF or manually enter crime statistics for this location.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pdf" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf" data-testid="tab-pdf-upload">PDF Upload</TabsTrigger>
            <TabsTrigger value="manual" data-testid="tab-manual-entry">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="dropzone-pdf"
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium" data-testid="text-selected-file">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-remove-file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handlePdfUpload}
                    disabled={pdfUploadMutation.isPending}
                    className="w-full"
                    data-testid="button-upload-pdf"
                  >
                    {pdfUploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing PDF...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Extract Data
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop your CAP Index PDF here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    data-testid="input-pdf-file"
                  />
                  <Label htmlFor="pdf-upload">
                    <Button variant="outline" asChild>
                      <span>Select PDF File</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              AI will automatically extract crime statistics from your CAP Index report. This process may take a few seconds.
            </p>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataTimePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Period</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 2024 Annual, Q3 2024"
                            data-testid="input-time-period"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="population"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Population</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="e.g., 50000"
                            data-testid="input-population"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="violentTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Violent Crimes</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="e.g., 150"
                            data-testid="input-violent-crimes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Property Crimes</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="e.g., 800"
                            data-testid="input-property-crimes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Springfield" data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Greene County" data-testid="input-county" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., IL" data-testid="input-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={manualEntryMutation.isPending}
                  className="w-full"
                  data-testid="button-save-manual"
                >
                  {manualEntryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Crime Data"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
