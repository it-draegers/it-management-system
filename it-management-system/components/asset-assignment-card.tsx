"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlink, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignAssetDialog } from "@/components/assign-asset-dialog";
import { assignAsset, setAssetAvailable } from "@/lib/actions/assets";

interface AssetAssignmentCardProps {
  assetId: string;
  assetName: string;
  assignedTo?: string | null;
  assignedToName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export function AssetAssignmentCard({
  assetId,
  assetName,
  assignedTo,
  assignedToName,
  createdAt,
  updatedAt,
}: AssetAssignmentCardProps) {
  const router = useRouter();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Assign asset to selected userId from dialog
  async function handleAssign(userId: string): Promise<void> {
    try {
        if (!userId) {
            console.log("Unassigning asset...");
            await setAssetAvailable(assetId);
            router.refresh();
            return;
        }
      await assignAsset(assetId, userId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAssignDialogOpen(false);
    }
  }

  return (
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
        {assignedTo ? (
          <div onClick={() => router.push(`/dashboard/users/${assignedTo}`)} className="transition duration-50 ease-in-out hover:bg-secondary/50 cursor-pointer rounded-md p-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="transition duration-150 ease-in-out h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {assignedToName || "Unknown User"}
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

        {/* Assign / Reassign button */}
        <div className="mt-4  gap-5 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
            {assignedTo ? "Reassign asset" : "Assign asset to user"}
          </Button>

        {/* AssignAssetDialog (pick user) */}
        <AssignAssetDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          assetName={assetName}
          onAssign={handleAssign}
          
        />

        <Button className='cursor-pointer' variant="destructive" size="sm" onClick={() => handleAssign("")} disabled={!assignedTo}>
            <Unlink className="mr-2 h-4 w-4" />
            Unassign
        </Button>
</div>
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