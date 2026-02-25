"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HardDrive, Unlink } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AssignUserDialog } from "@/components/assign-user-dialogue";
import { assignAsset, setAssetAvailable } from "@/lib/actions/assets";

interface UserAssetsCardProps {
  userId: string;
  userName: string;
  // Assets currently assigned to this user
  assignedAssets: {
    _id: string;
    name: string;
    type?: string;
    brand?: string;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function UserAssetsCard({
  userId,
  userName,
  assignedAssets,
  createdAt,
  updatedAt,
}: UserAssetsCardProps) {
  const router = useRouter();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Assign selected assetId to this user
  async function handleAssign(assetId: string): Promise<void> {
    try {
      await assignAsset(assetId, userId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAssignDialogOpen(false);
    }
  }

  // Unassign a specific asset (set to available)
  async function handleUnassign(assetId: string): Promise<void> {
    try {
      await setAssetAvailable(assetId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            Assets
          </CardTitle>
        </div>
        <CardDescription>
          Assets currently assigned to {userName || "this user"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Assigned assets list */}
        {assignedAssets && assignedAssets.length > 0 ? (
          <div className="flex flex-col gap-2">
            {assignedAssets.map((asset) => (
              <div
                key={asset._id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {asset.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {asset.type ?? ""} {asset.brand ? `• ${asset.brand}` : ""}
                  </span>
                </div>
               
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
            <HardDrive className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              No assets are currently assigned to this user
            </p>
          </div>
        )}

        {/* Assign / Add asset button */}
        <div className="mt-4 flex justify-start">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setAssignDialogOpen(true)}
          >
            {assignedAssets.length > 0 ? "Assign / Reassign Asset" : "Assign Asset"}
          </Button>
          <Button className='cursor-pointer' variant="destructive" size="sm" onClick={() => handleUnassign(assignedAssets[0]._id)} disabled={assignedAssets.length === 0}>
            <Unlink className="mr-2 h-4 w-4" />
            Unassign
        </Button>
        </div>

        {/* Dialog to choose an asset for this user */}
        <AssignUserDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          userName={userName}
          onAssign={handleAssign}
        />

        {/* Meta info */}
        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            Created:{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}