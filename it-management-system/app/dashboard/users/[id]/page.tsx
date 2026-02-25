import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/actions/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  HardDrive,
  User,
  Calendar,
  Hash,
  Tag,
  FileText,
  MapPin,
  Pencil,
  Computer,
  Phone,
} from "lucide-react";
import React from "react";
import { UserAssetsCard } from "@/components/UserAssetsCard";

const userStatusColors: Record<string, string> = {
  active: "border-success/30 bg-success/10 text-success",
  inactive: "border-secondary/30 bg-secondary/10 text-secondary",
  suspended: "border-destructive/30 bg-destructive/10 text-destructive",
};
export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUser(id);

  if ("error" in data) {
    notFound();
  }
  console.log("User data:", data);

  const user = "user" in data ? data.user : null;
  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to users</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {(user as any).firstName} {(user as any).lastName}
          </h1>
          <p className="text-sm text-muted-foreground"></p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${userStatusColors[(user as any).status] || ""}`}
        >
          {(user as any).status.charAt(0).toUpperCase() +
            (user as any).status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Details Card */}
        <Card className="border-border">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                User Details
              </CardTitle>
            </div>
            <Button asChild variant="default">
              <Link href={`/dashboard/users/${id}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit user</span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Deprtment</p>
                  <p className="text-sm font-medium text-foreground">
                    {(user as any).department || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {(user as any).email || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">
                    {(user as any).location || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {(user as any).phone || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {(user as any).employeeId || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    User Created Date
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
<UserAssetsCard
  userId={user._id}
  userName={`${user.firstName} ${user.lastName}`}
  assignedAssets={user.assignedAssets ?? []}
  createdAt={user.createdAt}
  updatedAt={user.updatedAt}
/>
        {/* Assignment Info Card */}
     
      </div>
    </div>
  );
}
