import { notFound } from "next/navigation"
import Link from "next/link"
import { getAsset } from "@/lib/actions/assets"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "lucide-react"

const statusColors: Record<string, string> = {
  available: "border-success/30 bg-success/10 text-success",
  assigned: "border-primary/30 bg-primary/10 text-primary",
  maintenance: "border-warning/30 bg-warning/10 text-warning",
  retired: "border-destructive/30 bg-destructive/10 text-destructive",
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAsset(id)

  if ("error" in result) {
    notFound()
  }

  const { asset } = result

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
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Asset Information
              </CardTitle>
               <Button asChild variant="default">
          <Link href={`/dashboard/assets/${id}/edit`}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit asset</span>
          </Link>
        </Button>
            </div>
            
            <CardDescription>General details about this asset</CardDescription>
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
                  <p className="text-xs text-muted-foreground">Brand / Model</p>
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
                  <p className="text-xs text-muted-foreground">Serial Number</p>
                  <p className="font-mono text-sm font-medium text-foreground">
                    {asset.serialNumber || "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {asset.purchaseDate || "-"}
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

        {/* Assignment Info Card */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Assignment
              </CardTitle>
            </div>
            <CardDescription>
              Current user assignment for this asset
            </CardDescription>
          </CardHeader>
          <CardContent>
            {asset.assignedTo ? (
              <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {asset.assignedToName || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to this user
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
                <User className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  This asset is not currently assigned to anyone
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs text-muted-foreground">
                Created:{" "}
                {new Date(asset.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(asset.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
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
                  {asset.customProperties.map((prop, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground">
                        {prop.key}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {prop.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
