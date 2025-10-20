import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Filter } from "lucide-react";

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

export default function TeamMembers() {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("all");

  const { data: organization } = useQuery<Organization | null>({
    queryKey: ["/api/team/organization"],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["/api/team/members"],
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
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>No organization found</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need to upgrade to a Basic, Pro, or Enterprise plan to access team collaboration features.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/pricing"}>
              View Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-heading" data-testid="heading-team">
            Team Members
          </h1>
        </div>
        <p className="text-muted-foreground" data-testid="text-team-subtitle">
          Manage your organization and collaborate with team members
        </p>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{organization.name}</CardTitle>
            </div>
            <Badge className={getTierColor(organization.accountTier)}>
              {organization.accountTier}
            </Badge>
          </div>
          <CardDescription>Organization details and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Members</span>
              <span className="text-2xl font-bold">
                {members.length} / {organization.maxMembers === -1 ? "∞" : organization.maxMembers}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Sites</span>
              <span className="text-2xl font-bold">
                {sites.length} / {organization.maxSites === -1 ? "∞" : organization.maxSites}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Assessments Limit</span>
              <span className="text-2xl font-bold">
                {organization.maxAssessments === -1 ? "Unlimited" : organization.maxAssessments}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>
            All members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell className="font-medium">
                        {member.username}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email || "No email set"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.organizationRole || "member"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(member.accountTier)}>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Team Sites</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="w-[200px]" data-testid="select-member-filter">
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
