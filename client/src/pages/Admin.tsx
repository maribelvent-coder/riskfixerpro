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
import { Shield, Key, UserCog, Database, AlertTriangle, Building2, Edit, Trash2, Link, Copy, Check } from "lucide-react";

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
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false);
  const [orgLimits, setOrgLimits] = useState({ maxMembers: 0, maxSites: 0, maxAssessments: 0 });
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/admin/organizations"],
  });

  const generateResetLinkMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/users/${userId}/generate-reset-link`,
        {}
      );
      return response.json();
    },
    onSuccess: (data) => {
      setResetLink(data.resetLink);
      setLinkCopied(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate reset link",
        description: error.message || "Failed to generate reset link. Please try again.",
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

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/users/${userId}/admin`,
        { isAdmin }
      );
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Admin status updated",
        description: variables.isAdmin ? "User is now an admin." : "Admin privileges removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update admin status",
        description: error.message || "Failed to update admin status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleAdmin = (user: User) => {
    toggleAdminMutation.mutate({ userId: user.id, isAdmin: !user.isAdmin });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      setShowDeleteUserDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/organizations/${orgId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization deleted",
        description: "The organization has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteOrgDialog(false);
      setSelectedOrg(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete organization",
        description: error.message || "Failed to delete organization. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id);
  };

  const handleDeleteOrg = (org: Organization) => {
    setSelectedOrg(org);
    setShowDeleteOrgDialog(true);
  };

  const handleConfirmDeleteOrg = () => {
    if (!selectedOrg) return;
    deleteOrgMutation.mutate(selectedOrg.id);
  };

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
    setResetLink(null);
    setLinkCopied(false);
    // Automatically generate the reset link
    generateResetLinkMutation.mutate(user.id);
  };

  const handleCopyLink = async () => {
    if (!resetLink) return;
    try {
      await navigator.clipboard.writeText(resetLink);
      setLinkCopied(true);
      toast({
        title: "Link copied",
        description: "Reset link copied to clipboard. Share it with the user.",
      });
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please select and copy manually.",
        variant: "destructive",
      });
    }
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
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading" data-testid="heading-admin">
            Admin Panel
          </h1>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm" data-testid="text-admin-subtitle">
          Manage users and system settings
        </p>
      </div>

      <Card className="p-3 sm:p-6">
        <CardHeader className="p-0 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">User Management</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              Loading users...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs sm:text-sm">
                    <TableHead className="text-xs sm:text-sm">Username</TableHead>
                    <TableHead className="text-xs sm:text-sm">Account Tier</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Role</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`} className="text-xs sm:text-sm">
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.accountTier}
                          onValueChange={(tier) => handleChangeTier(user.id, tier)}
                          disabled={changeTierMutation.isPending}
                        >
                          <SelectTrigger className="w-[100px] sm:w-[140px] text-xs sm:text-sm h-8 sm:h-9" data-testid={`select-tier-${user.id}`}>
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
                      <TableCell className="hidden sm:table-cell">
                        <Button
                          variant={user.isAdmin ? "default" : "outline"}
                          size="sm"
                          className={`text-[10px] sm:text-xs ${user.isAdmin ? "bg-accent-orange hover:bg-accent-orange/90" : ""}`}
                          onClick={() => handleToggleAdmin(user)}
                          disabled={toggleAdminMutation.isPending}
                          data-testid={`button-toggle-admin-${user.id}`}
                        >
                          <Shield className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          {user.isAdmin ? "Admin" : "Make Admin"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => handleResetPassword(user)}
                            data-testid={`button-reset-${user.id}`}
                          >
                            <Key className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Reset</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteUser(user)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-6">
        <CardHeader className="p-0 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">Organization Management</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Customize organization limits for any tier
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {orgsLoading ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              Loading organizations...
            </div>
          ) : !organizations || organizations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No organizations found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs sm:text-sm">
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tier</TableHead>
                    <TableHead className="text-xs sm:text-sm text-center hidden sm:table-cell">Members</TableHead>
                    <TableHead className="text-xs sm:text-sm text-center hidden sm:table-cell">Sites</TableHead>
                    <TableHead className="text-xs sm:text-sm text-center hidden md:table-cell">Assessments</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Created</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id} data-testid={`row-org-${org.id}`} className="text-xs sm:text-sm">
                      <TableCell className="font-medium text-xs sm:text-sm">{org.name}</TableCell>
                      <TableCell>
                        <Badge className={`${org.accountTier === 'enterprise' ? 'bg-purple-500' : org.accountTier === 'pro' ? 'bg-blue-500' : 'bg-green-500'} text-[10px] sm:text-xs`}>
                          {org.accountTier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">
                        {org.maxMembers === -1 ? '∞' : org.maxMembers}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">
                        {org.maxSites === -1 ? '∞' : org.maxSites}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm hidden md:table-cell">
                        {org.maxAssessments === -1 ? '∞' : org.maxAssessments}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm"
                            onClick={() => handleEditOrgLimits(org)}
                            data-testid={`button-edit-limits-${org.id}`}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteOrg(org)}
                            data-testid={`button-delete-org-${org.id}`}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-6">
        <CardHeader className="p-0 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">Database Management</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Seed the production database with template questions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              This will populate the database with all template questions including:
            </p>
            <ul className="text-xs sm:text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>34 Executive Interview questions</li>
              <li>39 Executive Survey questions (includes facility survey templates)</li>
            </ul>
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-2 sm:p-3">
              <p className="text-xs sm:text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                Warning: Destructive Operation
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                This will replace all existing template questions. Any associated facility survey data may be deleted.
              </p>
            </div>
            <Button
              onClick={() => setShowSeedConfirm(true)}
              disabled={seedProductionMutation.isPending}
              data-testid="button-seed-production"
              variant="destructive"
              className="text-xs sm:text-sm"
            >
              <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {seedProductionMutation.isPending ? "Seeding..." : "Seed Production Database"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent data-testid="dialog-reset-password">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Password Reset Link
            </DialogTitle>
            <DialogDescription>
              Generate a password reset link for user: <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {generateResetLinkMutation.isPending ? (
              <div className="text-center py-4 text-muted-foreground">
                Generating reset link...
              </div>
            ) : resetLink ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Reset Link</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={resetLink}
                      className="font-mono text-xs"
                      data-testid="input-reset-link"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      data-testid="button-copy-link"
                    >
                      {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-muted rounded-md p-3 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Share this link with the user. They can use it to set a new password.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This link expires in 24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-destructive">
                Failed to generate reset link. Please try again.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetDialog(false);
                setResetLink(null);
                setSelectedUser(null);
              }}
              data-testid="button-close-reset"
            >
              Close
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

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent data-testid="dialog-delete-user">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete user <strong>{selectedUser?.username}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This will delete the user and their associated organization if they are the owner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteUserDialog(false);
                setSelectedUser(null);
              }}
              disabled={deleteUserMutation.isPending}
              data-testid="button-cancel-delete-user"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Confirmation Dialog */}
      <Dialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
        <DialogContent data-testid="dialog-delete-org">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete organization <strong>{selectedOrg?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                All members will be removed from the organization. Their accounts will remain but without an organization.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteOrgDialog(false);
                setSelectedOrg(null);
              }}
              disabled={deleteOrgMutation.isPending}
              data-testid="button-cancel-delete-org"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteOrg}
              disabled={deleteOrgMutation.isPending}
              data-testid="button-confirm-delete-org"
            >
              {deleteOrgMutation.isPending ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
