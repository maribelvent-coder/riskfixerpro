import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
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
import { Loader2, Package } from "lucide-react";

const addDockFormSchema = z.object({
  dockNumber: z.string().min(1, "Dock identifier is required"),
  securityScore: z.number().min(0).max(100),
  hasCctv: z.boolean(),
  hasMotionSensor: z.boolean(),
  hasAlarm: z.boolean(),
  hasAccessControl: z.boolean().optional(),
  lightingQuality: z.string().optional(),
  notes: z.string().optional(),
});

type AddDockFormValues = z.infer<typeof addDockFormSchema>;

interface AddDockDialogProps {
  assessmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDockDialog({ assessmentId, open, onOpenChange }: AddDockDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<AddDockFormValues>({
    resolver: zodResolver(addDockFormSchema),
    defaultValues: {
      dockNumber: "",
      securityScore: 50,
      hasCctv: false,
      hasMotionSensor: false,
      hasAlarm: false,
      hasAccessControl: false,
      lightingQuality: "",
      notes: "",
    },
  });

  const createDockMutation = useMutation({
    mutationFn: async (data: AddDockFormValues) => {
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

  const onSubmit = (data: AddDockFormValues) => {
    createDockMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Loading Dock
          </DialogTitle>
          <DialogDescription>
            Configure a new loading dock with security features and assessment details.
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

              {/* Motion Sensor */}
              <FormField
                control={form.control}
                name="hasMotionSensor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-motion-sensor"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Motion Sensor / Door Sensor</FormLabel>
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

              {/* Access Control */}
              <FormField
                control={form.control}
                name="hasAccessControl"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-access-control"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Access Control System</FormLabel>
                      <FormDescription>
                        Restricted access via badge, keypad, or biometric
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Lighting Quality */}
            <FormField
              control={form.control}
              name="lightingQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lighting Quality (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Excellent, Good, Fair, Poor"
                      data-testid="input-lighting-quality"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the lighting conditions at this loading dock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createDockMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDockMutation.isPending}
                data-testid="button-submit"
              >
                {createDockMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Dock...
                  </>
                ) : (
                  "Add Loading Dock"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
