import { notFound } from "next/navigation";
import Link from "next/link";
import { ProgramsCard, type Program } from "@/components/programs-card";
import {
  addProgramToAsset,
  removeProgramFromAsset,
  getAssetWithPrograms,
} from "@/lib/actions/program";

import { getAsset } from "@/lib/actions/assets";
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
  Calendar,
  Hash,
  Tag,
  FileText,
  MapPin,
  Pencil,
  Building,
  Network,
  Monitor,
} from "lucide-react";
import { AssetAssignmentCard } from "@/components/asset-assignment-card";
import { DeleteAssetButton } from "@/components/ui/DeleteAssetButton";
import { getServer } from "@/lib/actions/servers";
import { DeleteServerButton } from "@/components/ui/DeleteServerButton";

const statusColors: Record<string, string> = {
  online: "border-success/30 bg-success/10 text-success",
  assigned: "border-primary/30 bg-primary/10 text-primary",
  decommissioned: "border-warning/30 bg-warning/10 text-warning",
  offline: "border-destructive/30 bg-destructive/10 text-destructive",
  GeneralUse: "border-primary/30 bg-primary/10 text-primary",
};

export default async function ServerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const result = await getServer(id);
  console.log("Server detail result:", result);

  if ("error" in result) {
    notFound();
  }

  const { server } = result;

  const programsResult = await getAssetWithPrograms(server._id.toString());
  const programs =
    "programs" in programsResult && Array.isArray(programsResult.programs)
      ? (programsResult.programs as Program[])
      : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/servers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to servers</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{server.name}</h1>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${statusColors[server.status] || ""}`}
        >
          {server.status}
        </Badge>
      </div>

      {/* Main grid */}
      <div className="grid gap-3 md:grid-cols-2 items-start">
        <Card className="border-border h-full">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Server Information
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="default">
                <Link href={`/dashboard/servers/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit server</span>
                </Link>
              </Button>

              <DeleteServerButton assetId={server._id.toString()} />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Network className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="text-sm font-medium text-foreground">
                    {server.ipAddress || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">
                    {server.role || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">
                    {server.location || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">OS</p>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {server.os || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Environment</p>
                  <p className="text-sm font-medium text-foreground">
                    {server.environment || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Serial Number</p>
                  <p className="text-sm font-medium text-foreground">
                    {server.serialNumber || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {server.notes && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm text-foreground">{server.notes}</p>
                  </div>
                </div>
              </>
            )}

           
          </CardContent>
        </Card>
         <div>
              <ProgramsCard
                assetId={server._id.toString()}
                programs={programs}
                onAddProgram={addProgramToAsset}
                onRemoveProgram={removeProgramFromAsset}
              />
            </div>
      </div>
    </div>
  );
}
