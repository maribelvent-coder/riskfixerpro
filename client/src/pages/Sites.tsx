import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, Building, Layers, Navigation } from "lucide-react";
import type { Site, FacilityZone } from "@shared/schema";
import { SiteGeoIntel } from "@/components/SiteGeoIntel";

const siteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  facilityType: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteSchema>;

const zoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  zoneType: z.string().optional().or(z.literal("")),
  floorNumber: z.preprocess(
    (val) => {
      // Allow empty/null/undefined to become undefined (valid for optional field)
      if (val === "" || val === null || val === undefined) return undefined;
      // Convert to number - let Zod validate if it's NaN
      return Number(val);
    },
    z.number().int("Floor number must be a whole number").optional()
  ),
  securityLevel: z.enum(["public", "restricted", "controlled", "high_security"]).optional(),
  description: z.string().optional().or(z.literal("")),
  accessRequirements: z.string().optional().or(z.literal("")),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

export default function Sites() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [managingZonesSite, setManagingZonesSite] = useState<Site | null>(null);
  const [geoIntelSite, setGeoIntelSite] = useState<Site | null>(null);
  const [editingZone, setEditingZone] = useState<FacilityZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<FacilityZone | null>(null);

  const { data: sites = [], isLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: SiteFormData) => {
      return apiRequest("POST", "/api/sites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Site created",
        description: "The site has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create site",
        description: error.message || "Something went wrong.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SiteFormData }) => {
      return apiRequest("PUT", `/api/sites/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setEditingSite(null);
      toast({
        title: "Site updated",
        description: "The site has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update site",
        description: error.message || "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      setDeletingSite(null);
      toast({
        title: "Site deleted",
        description: "The site has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete site",
        description: error.message || "Something went wrong.",
      });
    },
  });

  // Facility Zones queries and mutations
  const { data: zones = [], isLoading: zonesLoading } = useQuery<FacilityZone[]>({
    queryKey: ["/api/sites", managingZonesSite?.id, "zones"],
    enabled: !!managingZonesSite,
    queryFn: async () => {
      if (!managingZonesSite) return [];
      const response = await fetch(`/api/sites/${managingZonesSite.id}/zones`);
      if (!response.ok) throw new Error("Failed to fetch zones");
      return response.json();
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      if (!managingZonesSite) throw new Error("No site selected");
      return apiRequest("POST", `/api/sites/${managingZonesSite.id}/zones`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", managingZonesSite?.id, "zones"] });
      zoneForm.reset();
      toast({
        title: "Zone created",
        description: "The facility zone has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create zone",
        description: error.message || "Something went wrong.",
      });
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ZoneFormData }) => {
      return apiRequest("PUT", `/api/zones/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", managingZonesSite?.id, "zones"] });
      setEditingZone(null);
      toast({
        title: "Zone updated",
        description: "The facility zone has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update zone",
        description: error.message || "Something went wrong.",
      });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites", managingZonesSite?.id, "zones"] });
      setDeletingZone(null);
      toast({
        title: "Zone deleted",
        description: "The facility zone has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete zone",
        description: error.message || "Something went wrong.",
      });
    },
  });

  const zoneForm = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      zoneType: "",
      floorNumber: undefined,
      securityLevel: undefined,
      description: "",
      accessRequirements: "",
    },
  });

  const editZoneForm = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: "",
      zoneType: "",
      floorNumber: undefined,
      securityLevel: undefined,
      description: "",
      accessRequirements: "",
    },
  });

  const createForm = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      facilityType: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      notes: "",
    },
  });

  const editForm = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      facilityType: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      notes: "",
    },
  });

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    editForm.reset({
      name: site.name,
      address: site.address || "",
      city: site.city || "",
      state: site.state || "",
      zipCode: site.zipCode || "",
      country: site.country || "",
      facilityType: site.facilityType || "",
      contactName: site.contactName || "",
      contactPhone: site.contactPhone || "",
      contactEmail: site.contactEmail || "",
      notes: site.notes || "",
    });
  };

  const onCreateSubmit = (data: SiteFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: SiteFormData) => {
    if (editingSite) {
      updateMutation.mutate({ id: editingSite.id, data });
    }
  };

  const handleEditZone = (zone: FacilityZone) => {
    setEditingZone(zone);
    editZoneForm.reset({
      name: zone.name,
      zoneType: zone.zoneType ?? "",
      floorNumber: zone.floorNumber ?? undefined,
      securityLevel: (zone.securityLevel as "public" | "restricted" | "controlled" | "high_security" | undefined) ?? undefined,
      description: zone.description ?? "",
      accessRequirements: zone.accessRequirements ?? "",
    });
  };

  const onCreateZoneSubmit = (data: ZoneFormData) => {
    createZoneMutation.mutate(data);
  };

  const onEditZoneSubmit = (data: ZoneFormData) => {
    if (editingZone) {
      updateZoneMutation.mutate({ id: editingZone.id, data });
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="heading-sites">
            Sites & Locations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your facility locations and site information
          </p>
        </div>
        <Button 
          onClick={() => {
            createForm.reset();
            setIsCreateDialogOpen(true);
          }}
          data-testid="button-create-site"
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover-elevate">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <div className="h-6 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 p-4 sm:p-6">
            <Building className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-3 sm:mb-4" data-testid="text-no-sites">
              No sites yet. Create your first site to get started.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-site" className="w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="hover-elevate" data-testid={`card-site-${site.id}`}>
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate" data-testid={`text-site-name-${site.id}`}>
                      {site.name}
                    </CardTitle>
                    {site.facilityType && (
                      <CardDescription className="mt-1 text-xs sm:text-sm capitalize">
                        {site.facilityType}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setGeoIntelSite(site)}
                      data-testid={`button-geo-intel-${site.id}`}
                      title="Geographic Intelligence"
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setManagingZonesSite(site)}
                      data-testid={`button-manage-zones-${site.id}`}
                      title="Manage Zones"
                    >
                      <Layers className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(site)}
                      data-testid={`button-edit-site-${site.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingSite(site)}
                      data-testid={`button-delete-site-${site.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:p-6 pt-0">
                {(site.address || site.city || site.state) && (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {site.address && <div className="truncate">{site.address}</div>}
                      {(site.city || site.state) && (
                        <div className="truncate">
                          {[site.city, site.state, site.zipCode].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {site.contactName && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <span className="font-medium">Contact:</span> {site.contactName}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Site Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Site</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new site or facility location for your assessments.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Headquarters, Building A" {...field} data-testid="input-site-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="facilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-facility-type">
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="datacenter">Data Center</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={createForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} data-testid="input-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={createForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} data-testid="input-zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} data-testid="input-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Site contact person" {...field} data-testid="input-contact-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={createForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional information about this site..."
                        rows={3}
                        {...field}
                        data-testid="textarea-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create" className="w-full sm:w-auto text-xs sm:text-sm">
                  {createMutation.isPending ? "Creating..." : "Create Site"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Site Dialog */}
      <Dialog open={!!editingSite} onOpenChange={(open) => !open && setEditingSite(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Site</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the site information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Headquarters, Building A" {...field} data-testid="input-edit-site-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="facilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-facility-type">
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="datacenter">Data Center</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} data-testid="input-edit-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} data-testid="input-edit-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} data-testid="input-edit-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} data-testid="input-edit-zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} data-testid="input-edit-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Site contact person" {...field} data-testid="input-edit-contact-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} data-testid="input-edit-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.com" {...field} data-testid="input-edit-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional information about this site..."
                        rows={3}
                        {...field}
                        data-testid="textarea-edit-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSite(null)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Updating..." : "Update Site"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSite} onOpenChange={(open) => !open && setDeletingSite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSite?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSite && deleteMutation.mutate(deletingSite.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Facility Zones Management Dialog */}
      <Dialog open={!!managingZonesSite} onOpenChange={(open) => {
        if (!open) {
          setManagingZonesSite(null);
          setEditingZone(null);
          zoneForm.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Facility Zones - {managingZonesSite?.name}</DialogTitle>
            <DialogDescription>
              Define and manage security zones within this facility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Zone Form */}
            <div>
              <h3 className="font-semibold mb-3">Add New Zone</h3>
              <Form {...zoneForm}>
                <form onSubmit={zoneForm.handleSubmit(onCreateZoneSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={zoneForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Lobby, Server Room" {...field} data-testid="input-zone-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={zoneForm.control}
                      name="zoneType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Perimeter, Interior" {...field} data-testid="input-zone-type" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={zoneForm.control}
                      name="floorNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 1, 2, 3" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              value={field.value ?? ""}
                              data-testid="input-zone-floor"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={zoneForm.control}
                      name="securityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-zone-security-level">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="restricted">Restricted</SelectItem>
                              <SelectItem value="controlled">Controlled</SelectItem>
                              <SelectItem value="high_security">High Security</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={zoneForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe this zone..." {...field} data-testid="textarea-zone-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={zoneForm.control}
                    name="accessRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Requirements</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Badge required, Manager approval" {...field} data-testid="input-zone-access" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createZoneMutation.isPending} data-testid="button-create-zone">
                    {createZoneMutation.isPending ? "Creating..." : "Add Zone"}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Existing Zones List */}
            <div>
              <h3 className="font-semibold mb-3">Existing Zones ({zones.length})</h3>
              {zonesLoading ? (
                <div className="text-sm text-muted-foreground">Loading zones...</div>
              ) : zones.length === 0 ? (
                <div className="text-sm text-muted-foreground">No zones defined yet. Add your first zone above.</div>
              ) : (
                <div className="space-y-2">
                  {zones.map((zone) => (
                    <Card key={zone.id} data-testid={`card-zone-${zone.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium" data-testid={`text-zone-name-${zone.id}`}>{zone.name}</div>
                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                              {zone.zoneType && <div>Type: {zone.zoneType}</div>}
                              {zone.floorNumber !== null && zone.floorNumber !== undefined && <div>Floor: {zone.floorNumber}</div>}
                              {zone.securityLevel && (
                                <div className="capitalize">Security: {zone.securityLevel.replace(/_/g, " ")}</div>
                              )}
                              {zone.description && <div className="mt-2">{zone.description}</div>}
                              {zone.accessRequirements && <div className="italic">Access: {zone.accessRequirements}</div>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditZone(zone)}
                              data-testid={`button-edit-zone-${zone.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeletingZone(zone)}
                              data-testid={`button-delete-zone-${zone.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingZonesSite(null)} data-testid="button-close-zones">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Dialog */}
      <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>Update the zone information.</DialogDescription>
          </DialogHeader>
          <Form {...editZoneForm}>
            <form onSubmit={editZoneForm.handleSubmit(onEditZoneSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editZoneForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Lobby" {...field} data-testid="input-edit-zone-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editZoneForm.control}
                  name="zoneType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Perimeter" {...field} data-testid="input-edit-zone-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editZoneForm.control}
                  name="floorNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value ?? ""}
                          data-testid="input-edit-zone-floor"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editZoneForm.control}
                  name="securityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-zone-security-level">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="controlled">Controlled</SelectItem>
                          <SelectItem value="high_security">High Security</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editZoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe this zone..." {...field} data-testid="textarea-edit-zone-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editZoneForm.control}
                name="accessRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Requirements</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Badge required" {...field} data-testid="input-edit-zone-access" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingZone(null)} data-testid="button-cancel-edit-zone">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateZoneMutation.isPending} data-testid="button-submit-edit-zone">
                  {updateZoneMutation.isPending ? "Updating..." : "Update Zone"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Zone Confirmation Dialog */}
      <AlertDialog open={!!deletingZone} onOpenChange={(open) => !open && setDeletingZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the zone "{deletingZone?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-zone">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingZone && deleteZoneMutation.mutate(deletingZone.id)}
              disabled={deleteZoneMutation.isPending}
              data-testid="button-confirm-delete-zone"
            >
              {deleteZoneMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Geographic Intelligence Dialog */}
      <Dialog open={!!geoIntelSite} onOpenChange={(open) => !open && setGeoIntelSite(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Geographic Intelligence - {geoIntelSite?.name}</DialogTitle>
            <DialogDescription>
              Location data, proximity analysis, and crime statistics for this site
            </DialogDescription>
          </DialogHeader>
          {geoIntelSite && <SiteGeoIntel site={geoIntelSite} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
