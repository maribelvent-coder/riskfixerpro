import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
            Upload a CAP Index PDF, import from national/city APIs, or manually enter crime statistics.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pdf" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pdf" data-testid="tab-pdf-upload">PDF</TabsTrigger>
            <TabsTrigger value="manual" data-testid="tab-manual-entry">Manual</TabsTrigger>
            <TabsTrigger value="bjs" data-testid="tab-bjs-data">BJS</TabsTrigger>
            <TabsTrigger value="city" data-testid="tab-city-data">City</TabsTrigger>
            <TabsTrigger value="fbi" data-testid="tab-fbi-data">FBI</TabsTrigger>
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

          <TabsContent value="bjs" className="space-y-4">
            <BJSDataImport siteId={siteId} assessmentId={assessmentId} onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="city" className="space-y-4">
            <CityDataImport siteId={siteId} assessmentId={assessmentId} onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="fbi" className="space-y-4">
            <FBIDataImport siteId={siteId} assessmentId={assessmentId} onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// FBI Data Import Component
interface FBIAgency {
  ori: string;
  agency_name: string;
  state_abbr: string;
  state_name: string;
  county_name?: string;
  city_name?: string;
  agency_type_name: string;
  population?: number;
}

function FBIDataImport({ siteId, assessmentId, onSuccess }: { siteId?: string; assessmentId?: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchResults, setSearchResults] = useState<FBIAgency[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<FBIAgency | null>(null);

  const searchMutation = useMutation({
    mutationFn: async ({ state, city }: { state: string; city?: string }) => {
      const params = new URLSearchParams();
      if (state) params.append("state", state);
      if (city) params.append("city", city);
      
      const response = await fetch(`/api/crime-data/fbi/agencies/search?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Search failed" }));
        throw new Error(error.error || "Failed to search FBI agencies");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.agencies || []);
      if (data.agencies?.length === 0) {
        toast({
          title: "No results",
          description: "No FBI agencies found for this location. Try a different search.",
        });
      }
    },
    onError: (error: Error) => {
      const isForbidden = error.message.includes("403") || error.message.toLowerCase().includes("forbidden");
      toast({
        title: "Search failed",
        description: isForbidden 
          ? "FBI API error: 403 Forbidden. The API key needs to be registered at https://crime-data-explorer.fr.cloud.gov/pages/docApi"
          : error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (ori: string) => {
      const response = await apiRequest("POST", "/api/crime-data/fbi/import", {
        ori,
        siteId,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "FBI data imported",
        description: "Crime statistics successfully imported from FBI database.",
      });
      // Invalidate crime sources for both site and assessment contexts
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", siteId] });
      }
      if (assessmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", assessmentId] });
      }
      setSelectedAgency(null);
      setSearchResults([]);
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchState) {
      toast({
        title: "State required",
        description: "Please enter a state abbreviation (e.g., IL, TX, CA)",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate({ state: searchState, city: searchCity });
  };

  const handleImport = (agency: FBIAgency) => {
    setSelectedAgency(agency);
    importMutation.mutate(agency.ori);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="fbi-state">State (Required)</Label>
          <Input
            id="fbi-state"
            placeholder="e.g., IL, TX, CA"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value.toUpperCase())}
            data-testid="input-fbi-state"
            maxLength={2}
          />
          <p className="text-xs text-muted-foreground">Enter 2-letter state code</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fbi-city">City (Optional)</Label>
          <Input
            id="fbi-city"
            placeholder="e.g., Chicago"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            data-testid="input-fbi-city"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={searchMutation.isPending || !searchState}
          className="w-full"
          data-testid="button-search-fbi"
        >
          {searchMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching FBI Database...
            </>
          ) : (
            "Search FBI Agencies"
          )}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-sm font-medium">
            Found {searchResults.length} {searchResults.length === 1 ? "agency" : "agencies"}
          </p>
          {searchResults.map((agency) => (
            <div
              key={agency.ori}
              className="p-3 border rounded-lg space-y-1 hover-elevate"
              data-testid={`fbi-agency-${agency.ori}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{agency.agency_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {agency.city_name && `${agency.city_name}, `}
                    {agency.county_name && `${agency.county_name} County, `}
                    {agency.state_abbr}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agency.agency_type_name}
                    {agency.population && ` • Pop: ${agency.population.toLocaleString()}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleImport(agency)}
                  disabled={importMutation.isPending}
                  data-testid={`button-import-${agency.ori}`}
                >
                  {importMutation.isPending && selectedAgency?.ori === agency.ori ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && !searchMutation.isPending && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Search for law enforcement agencies by state and city</p>
          <p className="text-xs mt-1">Data from FBI Uniform Crime Reporting (UCR) Program</p>
        </div>
      )}
    </div>
  );
}

// BJS NIBRS Data Import Component
function BJSDataImport({ siteId, assessmentId, onSuccess }: { siteId?: string; assessmentId?: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [year, setYear] = useState(2023); // Default to 2023 (most recent available)
  
  const importMutation = useMutation({
    mutationFn: async (selectedYear: number) => {
      const response = await apiRequest("POST", "/api/crime-data/bjs/import", {
        year: selectedYear,
        siteId,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "BJS data imported",
        description: `National crime statistics for ${year} successfully imported from Bureau of Justice Statistics.`,
      });
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", siteId] });
      }
      if (assessmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", assessmentId] });
      }
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    importMutation.mutate(year);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="bjs-year">Year</Label>
          <select
            id="bjs-year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="input-bjs-year"
          >
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
            <option value={2021}>2021</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Select year for national crime statistics (2021-2023 available)
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={importMutation.isPending}
          className="w-full"
          data-testid="button-import-bjs"
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing BJS Data...
            </>
          ) : (
            "Import National Statistics"
          )}
        </Button>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
        <p className="font-medium">About BJS NIBRS Data:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>National Incident-Based Reporting System (NIBRS)</li>
          <li>Estimates from Bureau of Justice Statistics</li>
          <li>National-level violent and property crime data</li>
          <li>No authentication required - free public data</li>
        </ul>
      </div>
    </div>
  );
}

// City Crime Data Import Component
interface CityOption {
  key: string;
  name: string;
}

function CityDataImport({ siteId, assessmentId, onSuccess }: { siteId?: string; assessmentId?: string; onSuccess: () => void }) {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [cities, setCities] = useState<CityOption[]>([]);

  // Fetch available cities on mount
  const citiesQuery = useQuery({
    queryKey: ["/api/crime-data/cities"],
    queryFn: async () => {
      const response = await fetch("/api/crime-data/cities", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data = await response.json();
      return data.cities as CityOption[];
    },
  });

  const importMutation = useMutation({
    mutationFn: async ({ cityKey, selectedYear }: { cityKey: string; selectedYear: number }) => {
      const response = await apiRequest("POST", "/api/crime-data/city/import", {
        cityKey,
        year: selectedYear,
        siteId,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const cityName = cities.find(c => c.key === selectedCity)?.name || selectedCity;
      toast({
        title: "City data imported",
        description: `Crime statistics for ${cityName} (${year}) successfully imported.`,
      });
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", siteId] });
      }
      if (assessmentId) {
        queryClient.invalidateQueries({ queryKey: ["/api/crime-sources", assessmentId] });
      }
      setSelectedCity("");
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (!selectedCity) {
      toast({
        title: "City required",
        description: "Please select a city",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate({ cityKey: selectedCity, selectedYear: year });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="city-select">City</Label>
          <select
            id="city-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="select-city"
          >
            <option value="">Select a city...</option>
            {citiesQuery.data?.map((city) => (
              <option key={city.key} value={city.key}>
                {city.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Select major US city for local crime statistics
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city-year">Year</Label>
          <Input
            id="city-year"
            type="number"
            min={2010}
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            data-testid="input-city-year"
          />
          <p className="text-xs text-muted-foreground">
            Select year (2010-{new Date().getFullYear()})
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={importMutation.isPending || !selectedCity}
          className="w-full"
          data-testid="button-import-city"
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing City Data...
            </>
          ) : (
            "Import City Statistics"
          )}
        </Button>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
        <p className="font-medium">Available Cities:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Seattle (SPD - 2008-present) - High accuracy</li>
          <li>Chicago (CPD - 2001-present) - High accuracy</li>
          <li>Los Angeles (LAPD - 2020-present) - Keyword estimation</li>
          <li>New York City (NYPD - current year) - Keyword estimation</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          Data from city open data portals via Socrata APIs
        </p>
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
          <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Note on LA/NYC Data:</p>
          <p className="text-muted-foreground">
            Los Angeles and New York City use keyword-based classification which may include some overlap between violent and property crime categories. Use these estimates as approximate indicators. Seattle and Chicago provide exact categorization.
          </p>
        </div>
      </div>
    </div>
  );
}
