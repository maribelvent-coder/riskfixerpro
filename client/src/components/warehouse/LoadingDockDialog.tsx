import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import type { LoadingDock } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Trash2 } from "lucide-react";

const dockFormSchema = z.object({
  dockNumber: z.string().min(1, "Dock identifier is required"),
  securityScore: z.number().min(0).max(100),
  hasCctv: z.boolean(),
  hasSensor: z.boolean(),
  hasAlarm: z.boolean(),
  notes: z.string().optional(),
});

type DockFormValues = z.infer<typeof dockFormSchema>;

interface LoadingDockDialogProps {
  assessmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dockToEdit?: LoadingDock;
}

export function LoadingDockDialog({ 
  assessmentId, 
  open, 
  onOpenChange,
  dockToEdit 
}: LoadingDockDialogProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isEditMode = !!dockToEdit;
  
  const form = useForm<DockFormValues>({
    resolver: zodResolver(dockFormSchema),
    defaultValues: {
      dockNumber: "",
      securityScore: 50,
      hasCctv: false,
      hasSensor: false,
      hasAlarm: false,
      notes: "",
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (dockToEdit) {
      form.reset({
        dockNumber: dockToEdit.dockNumber,
        securityScore: dockToEdit.securityScore ?? 50,
        hasCctv: dockToEdit.hasCctv,
        hasSensor: dockToEdit.hasSensor,
        hasAlarm: dockToEdit.hasAlarm,
        notes: dockToEdit.notes ?? "",
      });
    } else {
      // Reset to defaults when creating new dock
      form.reset({
        dockNumber: "",
        securityScore: 50,
        hasCctv: false,
        hasSensor: false,
        hasAlarm: false,
        notes: "",
      });
    }
  }, [dockToEdit, form]);

  const createDockMutation = useMutation({
    mutationFn: async (data: DockFormValues) => {
      return await apiRequest("POST", `/api/assessments/${assessmentId}/loading-docks`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${assessmentId}/warehouse-analysis`] });
      
      toast({
        title: "Loading Dock Added",
        description: "The loading dock has been successfully created.",
      });
      
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loading dock. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDockMutation = useMutation({
    mutationFn: async (data: DockFormValues) => {
      if (!dockToEdit) throw new Error("No dock to update");
      return await apiRequest("PATCH", `/api/assessments/${assessmentId}/loading-docks/${dockToEdit.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${assessmentId}/warehouse-analysis`] });
      
      toast({
        title: "Loading Dock Updated",
        description: "The loading dock has been successfully updated.",
      });
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update loading dock. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteDockMutation = useMutation({
    mutationFn: async () => {
      if (!dockToEdit) throw new Error("No dock to delete");
      return await apiRequest("DELETE", `/api/assessments/${assessmentId}/loading-docks/${dockToEdit.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${assessmentId}/warehouse-analysis`] });
      
      toast({
        title: "Loading Dock Deleted",
        description: "The loading dock has been successfully removed.",
      });
      
      setShowDeleteConfirm(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete loading dock. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DockFormValues) => {
    if (isEditMode) {
      updateDockMutation.mutate(data);
    } else {
      createDockMutation.mutate(data);
    }
  };

  const isPending = createDockMutation.isPending || updateDockMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isEditMode ? "Edit Loading Dock" : "Add Loading Dock"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the loading dock's security features and assessment details."
                : "Configure a new loading dock with security features and assessment details."
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dock Identifier */}
              <FormField
                control={form.control}
                name="dockNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dock Identifier *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dock 1, Bay A, Loading Door 3"
                        data-testid="input-dock-number"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a unique identifier for this loading dock.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Security Score Slider */}
              <FormField
                control={form.control}
                name="securityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Score: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        data-testid="slider-security-score"
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Manually set an initial security score (0-100). This will be refined based on the controls below.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Security Features Checkboxes */}
              <div className="space-y-4">
                <div className="text-sm font-medium">Security Features</div>
                
                {/* CCTV */}
                <FormField
                  control={form.control}
                  name="hasCctv"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-cctv"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>CCTV Camera Present</FormLabel>
                        <FormDescription>
                          Video surveillance coverage for this loading dock
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Door/Motion Sensor */}
                <FormField
                  control={form.control}
                  name="hasSensor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-sensor"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Door Sensor / Motion Sensor</FormLabel>
                        <FormDescription>
                          Intrusion detection sensor monitoring this area
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Alarm */}
                <FormField
                  control={form.control}
                  name="hasAlarm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-alarm"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Alarm System</FormLabel>
                        <FormDescription>
                          Active alarm system protecting this loading dock
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional observations, vulnerabilities, or recommendations..."
                        rows={4}
                        data-testid="textarea-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional security observations or notes about this loading dock.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between">
                {/* Delete button (edit mode only) */}
                {isEditMode && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isPending}
                    data-testid="button-delete"
                    className="mr-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Dock
                  </Button>
                )}

                {/* Cancel and Submit buttons */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    data-testid="button-submit"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      isEditMode ? "Update Loading Dock" : "Add Loading Dock"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loading Dock?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{dockToEdit?.dockNumber}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDockMutation.mutate()}
              disabled={deleteDockMutation.isPending}
              data-testid="button-delete-confirm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
