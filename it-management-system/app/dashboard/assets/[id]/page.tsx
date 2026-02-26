import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ProgramsCard,
  type Program,
} from "@/components/programs-card";
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
  User,
  Calendar,
  Hash,
  Tag,
  FileText,
  MapPin,
  Pencil,
  Building,
} from "lucide-react";
import { AssetAssignmentCard } from "@/components/asset-assignment-card";
import { DeleteAssetButton } from "@/components/ui/DeleteAssetButton";

const statusColors: Record<string, string> = {
  available: "border-success/30 bg-success/10 text-success",
  assigned: "border-primary/30 bg-primary/10 text-primary",
  maintenance: "border-warning/30 bg-warning/10 text-warning",
  retired: "border-destructive/30 bg-destructive/10 text-destructive",
  GeneralUse: "border-primary/30 bg-primary/10 text-primary",
};

export default async function AssetDetailPage({
  
  params,
}: {
  params: { id: string };
}) {
  "use server";
  const { id } = await params;

  const result = await getAsset(id);

  if ("error" in result) {
    notFound();
  }

  const { asset } = result;

  const programsResult = await getAssetWithPrograms(asset._id.toString());
  const programs =
    "programs" in programsResult && Array.isArray(programsResult.programs)
      ? (programsResult.programs as Program[])
      : [];
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/assets">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to assets</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{asset.name}</h1>
          <p className="text-sm text-muted-foreground">
            {asset.type} - {asset.brand} {asset.model}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-sm ${statusColors[asset.status] || ""}`}
        >
          {asset.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Asset Details Card */}
        <Card className="border-border">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Asset Information
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="default">
                <Link href={`/dashboard/assets/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit asset</span>
                </Link>
              </Button>

              <DeleteAssetButton assetId={asset._id.toString()} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.type}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Brand / Model
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.brand || "-"} {asset.model || ""}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.location || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Serial Number
                  </p>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {asset.serialNumber || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Purchase Date
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.purchaseDate || "-"}
                  </p>
                </div>
              </div>

              <Separator />
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.department || "-"}
                  </p>
                </div>
              </div>

              {asset.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground">{asset.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Card */}
        <AssetAssignmentCard
          assetId={asset._id}
          assetName={asset.name}
          assignedTo={asset.assignedTo}
          assignedToName={asset.assignedToName}
          createdAt={asset.createdAt}
          updatedAt={asset.updatedAt}
        />

        {/* Programs Card */}
        <ProgramsCard
          assetId={asset._id.toString()}
          programs={programs}
          onAddProgram={addProgramToAsset}
          onRemoveProgram={removeProgramFromAsset}
        />
      </div>

      {/* Custom Properties */}
      {asset.customProperties && asset.customProperties.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Custom Properties
            </CardTitle>
            <CardDescription>
              Additional properties assigned to this asset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Property
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asset.customProperties.map(
                    (
                      prop: { key: string; value: string | number },
                      index: number,
                    ) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-foreground">
                          {prop.key}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {prop.value}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function setLocalPrograms(programs: Program[]) {
  throw new Error("Function not implemented.");
}
