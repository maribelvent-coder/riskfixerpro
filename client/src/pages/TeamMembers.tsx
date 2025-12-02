import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Filter, UserPlus, Mail, Trash2, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  username: string;
  email: string | null;
  accountTier: string;
  organizationId: string | null;
  organizationRole: string | null;
};

type Organization = {
  id: string;
  name: string;
  accountTier: string;
  maxMembers: number;
  maxSites: number;
  maxAssessments: number;
};

type Site = {
  id: string;
  userId: string;
  name: string;
  city: string | null;
  state: string | null;
  facilityType: string | null;
};

type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "admin"], {
    required_error: "Please select a role",
  }),
});

const createOrgFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

export default function TeamMembers() {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: organization } = useQuery<Organization | null>({
    queryKey: ["/api/team/organization"],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["/api/team/members"],
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<OrganizationInvitation[]>({
    queryKey: ["/api/organizations", organization?.id, "invitations"],
    enabled: !!organization?.id,
  });

  const { data: sites = [], isLoading: sitesLoading } = useQuery<Site[]>({
    queryKey: ["/api/team/sites", selectedMemberId],
    queryFn: async () => {
      const url = selectedMemberId === "all"
        ? "/api/team/sites"
        : `/api/team/sites?memberId=${selectedMemberId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch sites");
      return response.json();
    },
  });

  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const createOrgForm = useForm<z.infer<typeof createOrgFormSchema>>({
    resolver: zodResolver(createOrgFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createOrgFormSchema>) => {
      return apiRequest("POST", "/api/organizations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setCreateOrgDialogOpen(false);
      createOrgForm.reset();
      toast({
        title: "Organization created",
        description: "Your organization has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create organization",
        description: error.message || "An error occurred while creating the organization.",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inviteFormSchema>) => {
      return apiRequest("POST", `/api/organizations/${organization?.id}/invitations`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", organization?.id, "invitations"] });
      setInviteDialogOpen(false);
      inviteForm.reset();
      toast({
        title: "Invitation sent",
        description: "The invitation email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiRequest("DELETE", `/api/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", organization?.id, "invitations"] });
      toast({
        title: "Invitation revoked",
        description: "The invitation has been revoked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to revoke invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

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

  if (!organization) {
    const hasQualifyingTier = currentUser?.accountTier && 
      ["basic", "pro", "enterprise"].includes(currentUser.accountTier.toLowerCase());

    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {hasQualifyingTier ? "Create your organization" : "No organization found"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasQualifyingTier ? (
              <>
                <p className="text-muted-foreground mb-4">
                  You have a {currentUser?.accountTier} plan. Create an organization to start collaborating with your team.
                </p>
                <Dialog open={createOrgDialogOpen} onOpenChange={setCreateOrgDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-organization">
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Organization</DialogTitle>
                      <DialogDescription>
                        Set up your organization to collaborate with team members and share resources.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...createOrgForm}>
                      <form onSubmit={createOrgForm.handleSubmit((data) => createOrgMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={createOrgForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Acme Security Consultants" 
                                  data-testid="input-org-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                The name of your company or team
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={createOrgMutation.isPending}
                            data-testid="button-submit-create-org"
                          >
                            {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  You need to upgrade to a Basic, Pro, or Enterprise plan to access team collaboration features.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/pricing"}>
                  View Pricing
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-heading" data-testid="heading-team">
            Team Members
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-team-subtitle">
          Manage your organization and collaborate with team members
        </p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg">{organization.name}</CardTitle>
            </div>
            <Badge className={`${getTierColor(organization.accountTier)} text-[10px] sm:text-xs`}>
              {organization.accountTier}
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm">Organization details and limits</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Members</span>
              <span className="text-xl sm:text-2xl font-bold">
                {members.length} / {organization.maxMembers === -1 ? "∞" : organization.maxMembers}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Sites</span>
              <span className="text-xl sm:text-2xl font-bold">
                {sites.length} / {organization.maxSites === -1 ? "∞" : organization.maxSites}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-muted-foreground">Assessments Limit</span>
              <span className="text-xl sm:text-2xl font-bold">
                {organization.maxAssessments === -1 ? "Unlimited" : organization.maxAssessments}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <CardTitle className="text-base sm:text-lg">Pending Invitations</CardTitle>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-invite-member" className="w-full sm:w-auto text-xs sm:text-sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization. They'll receive an email with a link to accept.
                  </DialogDescription>
                </DialogHeader>
                <Form {...inviteForm}>
                  <form onSubmit={inviteForm.handleSubmit((data) => inviteMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={inviteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="colleague@example.com" 
                              data-testid="input-invite-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The email address of the person you want to invite
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inviteForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-invite-role">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The access level for this team member
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                        data-testid="button-cancel-invite"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={inviteMutation.isPending}
                        data-testid="button-send-invite"
                      >
                        {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Invitations waiting to be accepted
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {invitationsLoading ? (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
              Loading invitations...
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Expires</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id} data-testid={`row-invitation-${invitation.id}`}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {invitation.email}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        <Badge variant={invitation.status === "pending" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeMutation.mutate(invitation.id)}
                          disabled={revokeMutation.isPending}
                          data-testid={`button-revoke-${invitation.id}`}
                          className="text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
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

      {/* Team Members List */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">Team Members</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            All members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {membersLoading ? (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Username</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {member.username}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                        {member.email || "No email set"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {member.organizationRole || "member"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge className={`${getTierColor(member.accountTier)} text-[10px] sm:text-xs`}>
                          {member.accountTier}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sites with Member Filter */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <CardTitle className="text-base sm:text-lg">Team Sites</CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-member-filter">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            {selectedMemberId === "all"
              ? "All sites from team members"
              : `Sites from ${members.find(m => m.id === selectedMemberId)?.username || "selected member"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sitesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading sites...
            </div>
          ) : sites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sites found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Facility Type</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => {
                    const owner = members.find(m => m.id === site.userId);
                    return (
                      <TableRow key={site.id} data-testid={`row-site-${site.id}`}>
                        <TableCell className="font-medium">
                          {site.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {site.city && site.state
                            ? `${site.city}, ${site.state}`
                            : site.city || site.state || "—"}
                        </TableCell>
                        <TableCell>
                          {site.facilityType ? (
                            <Badge variant="outline">{site.facilityType}</Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {owner?.username || "Unknown"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
