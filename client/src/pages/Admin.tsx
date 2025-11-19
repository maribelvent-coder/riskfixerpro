import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, UserCog, Database, AlertTriangle, Building2, Edit } from "lucide-react";

type User = {
  id: string;
  username: string;
  email: string | null;
  accountTier: string;
  isAdmin: boolean;
  createdAt: string;
};

type Organization = {
  id: string;
  name: string;
  accountTier: string;
  maxMembers: number;
  maxSites: number;
  maxAssessments: number;
  createdAt: string;
};

export default function Admin() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showOrgLimitsDialog, setShowOrgLimitsDialog] = useState(false);
  const [orgLimits, setOrgLimits] = useState({ maxMembers: 0, maxSites: 0, maxAssessments: 0 });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/admin/organizations"],
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/users/${userId}/reset-password`,
        { newPassword: password }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: `Password for ${selectedUser?.username} has been reset.`,
      });
      setShowResetDialog(false);
      setNewPassword("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Password reset failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changeTierMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/users/${userId}/tier`,
        { accountTier: tier }
      );
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Tier updated successfully",
        description: `Account tier has been changed to ${variables.tier}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Tier update failed",
        description: error.message || "Failed to update tier. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateOrgLimitsMutation = useMutation({
    mutationFn: async ({ orgId, limits }: { orgId: string; limits: { maxMembers: number; maxSites: number; maxAssessments: number } }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/organizations/${orgId}/limits`,
        limits
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization limits updated",
        description: "The organization limits have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      setShowOrgLimitsDialog(false);
      setSelectedOrg(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update limits",
        description: error.message || "Failed to update organization limits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const seedProductionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/seed-production", {});
      return response.json();
    },
    onSuccess: (data) => {
      setShowSeedConfirm(false);
      const hasErrors = data.results.errors.length > 0;
      const hasWarnings = data.results.warnings && data.results.warnings.length > 0;
      
      let description = `Loaded ${data.results.interviewQuestions} interview questions and ${data.results.executiveSurveyQuestions} executive survey questions.`;
      
      if (hasErrors) {
        description += `\n\nErrors: ${data.results.errors.join(', ')}`;
      }
      
      if (hasWarnings) {
        description += `\n\nWarnings: ${data.results.warnings.join(', ')}`;
      }
      
      toast({
        title: hasErrors ? "Partial success" : "Database seeded successfully",
        description,
        variant: hasErrors ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      setShowSeedConfirm(false);
      toast({
        title: "Database seeding failed",
        description: error.message || "Failed to seed database. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetDialog(true);
    setNewPassword("");
  };

  const handleConfirmReset = () => {
    if (!selectedUser) return;
    if (newPassword.length < 8) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "enterprise":
        return "bg-purple-500";
      case "pro":
        return "bg-blue-500";
      case "basic":
        return "bg-green-500";
      case "free":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleChangeTier = (userId: string, tier: string) => {
    changeTierMutation.mutate({ userId, tier });
  };

  const handleEditOrgLimits = (org: Organization) => {
    setSelectedOrg(org);
    setOrgLimits({
      maxMembers: org.maxMembers,
      maxSites: org.maxSites,
      maxAssessments: org.maxAssessments,
    });
    setShowOrgLimitsDialog(true);
  };

  const handleUpdateLimits = () => {
    if (!selectedOrg) return;
    updateOrgLimitsMutation.mutate({
      orgId: selectedOrg.id,
      limits: orgLimits,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-heading" data-testid="heading-admin">
            Admin Panel
          </h1>
        </div>
        <p className="text-muted-foreground" data-testid="text-admin-subtitle">
          Manage users and system settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <CardTitle>User Management</CardTitle>
          </div>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading users...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Account Tier</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.accountTier}
                          onValueChange={(tier) => handleChangeTier(user.id, tier)}
                          disabled={changeTierMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-tier-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.isAdmin && (
                          <Badge variant="secondary" className="bg-accent-orange text-white">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          data-testid={`button-reset-${user.id}`}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Organization Management</CardTitle>
          </div>
          <CardDescription>
            Customize organization limits for any tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orgsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading organizations...
            </div>
          ) : !organizations || organizations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No organizations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Members</TableHead>
                    <TableHead className="text-center">Sites</TableHead>
                    <TableHead className="text-center">Assessments</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge className={org.accountTier === 'enterprise' ? 'bg-purple-500' : org.accountTier === 'pro' ? 'bg-blue-500' : 'bg-green-500'}>
                          {org.accountTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {org.maxMembers === -1 ? '∞' : org.maxMembers}
                      </TableCell>
                      <TableCell className="text-center">
                        {org.maxSites === -1 ? '∞' : org.maxSites}
                      </TableCell>
                      <TableCell className="text-center">
                        {org.maxAssessments === -1 ? '∞' : org.maxAssessments}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrgLimits(org)}
                          data-testid={`button-edit-limits-${org.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Limits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Database Management</CardTitle>
          </div>
          <CardDescription>
            Seed the production database with template questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will populate the database with all template questions including:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>34 Executive Interview questions</li>
              <li>39 Executive Survey questions (includes facility survey templates)</li>
            </ul>
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning: Destructive Operation
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will replace all existing template questions. Any associated facility survey data may be deleted.
              </p>
            </div>
            <Button
              onClick={() => setShowSeedConfirm(true)}
              disabled={seedProductionMutation.isPending}
              data-testid="button-seed-production"
              variant="destructive"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedProductionMutation.isPending ? "Seeding..." : "Seed Production Database"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent data-testid="dialog-reset-password">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset the password for user: <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setNewPassword("");
                setSelectedUser(null);
              }}
              data-testid="button-cancel-reset"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReset}
              disabled={resetPasswordMutation.isPending || newPassword.length < 8}
              data-testid="button-confirm-reset"
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Limits Dialog */}
      <Dialog open={showOrgLimitsDialog} onOpenChange={setShowOrgLimitsDialog}>
        <DialogContent data-testid="dialog-edit-org-limits">
          <DialogHeader>
            <DialogTitle>Edit Organization Limits</DialogTitle>
            <DialogDescription>
              Customize limits for: <strong>{selectedOrg?.name}</strong> (Enterprise)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="max-members">Max Members</Label>
              <Input
                id="max-members"
                type="number"
                min="-1"
                placeholder="Enter max members (-1 for unlimited)"
                value={orgLimits.maxMembers}
                onChange={(e) => setOrgLimits({ ...orgLimits, maxMembers: parseInt(e.target.value) || 0 })}
                data-testid="input-max-members"
              />
              <p className="text-sm text-muted-foreground">
                Use -1 for unlimited members
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-sites">Max Sites</Label>
              <Input
                id="max-sites"
                type="number"
                min="-1"
                placeholder="Enter max sites (-1 for unlimited)"
                value={orgLimits.maxSites}
                onChange={(e) => setOrgLimits({ ...orgLimits, maxSites: parseInt(e.target.value) || 0 })}
                data-testid="input-max-sites"
              />
              <p className="text-sm text-muted-foreground">
                Use -1 for unlimited sites
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-assessments">Max Assessments</Label>
              <Input
                id="max-assessments"
                type="number"
                min="-1"
                placeholder="Enter max assessments (-1 for unlimited)"
                value={orgLimits.maxAssessments}
                onChange={(e) => setOrgLimits({ ...orgLimits, maxAssessments: parseInt(e.target.value) || 0 })}
                data-testid="input-max-assessments"
              />
              <p className="text-sm text-muted-foreground">
                Use -1 for unlimited assessments
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOrgLimitsDialog(false);
                setSelectedOrg(null);
              }}
              data-testid="button-cancel-limits"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLimits}
              disabled={updateOrgLimitsMutation.isPending}
              data-testid="button-save-limits"
            >
              {updateOrgLimitsMutation.isPending ? "Saving..." : "Save Limits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seed Production Confirmation Dialog */}
      <Dialog open={showSeedConfirm} onOpenChange={setShowSeedConfirm}>
        <DialogContent data-testid="dialog-seed-confirm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Database className="h-5 w-5" />
              Confirm Database Seeding
            </DialogTitle>
            <DialogDescription>
              This is a destructive operation that will replace all template questions in the database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 space-y-2">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning: This action will:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Delete all existing template questions</li>
                <li>Potentially delete associated facility survey data</li>
                <li>Replace with fresh template data</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This operation is intended for initial production setup or data recovery. 
              Are you sure you want to proceed?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSeedConfirm(false)}
              disabled={seedProductionMutation.isPending}
              data-testid="button-cancel-seed"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => seedProductionMutation.mutate()}
              disabled={seedProductionMutation.isPending}
              data-testid="button-confirm-seed"
            >
              {seedProductionMutation.isPending ? "Seeding..." : "Yes, Seed Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
