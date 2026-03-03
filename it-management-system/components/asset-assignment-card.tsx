"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlink, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssignAssetDialog } from "@/components/assign-asset-dialog";
import { assignAsset, setAssetAvailable } from "@/lib/actions/assets";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
  const [assetToUnassign, setAssetToUnassign] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Assign or unassign asset
  async function handleAssign(userId: string): Promise<void> {
    try {
      if (!userId) {
        // Unassign -> set asset to available
        await setAssetAvailable(assetId);
        toast.success("Asset unassigned successfully");
      } else {
        await assignAsset(assetId, userId);
        toast.success("Asset assignment updated successfully");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating the assignment");
    } finally {
      setAssignDialogOpen(false);
    }
  }

  const formatDate = (value: string | Date) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
          <div
            onClick={() => router.push(`/dashboard/users/${assignedTo}`)}
            className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition duration-150 ease-in-out hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary transition duration-150 ease-in-out" />
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

        <div className="mt-4 flex justify-center gap-3">
          <Button
          className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => setAssignDialogOpen(true)}
          >
            {assignedTo ? "Reassign asset" : "Assign asset to user"}
          </Button>

          <Button
            className="cursor-pointer"
            variant="destructive"
            size="sm"
            disabled={!assignedTo}
            onClick={() => {
              if (!assignedTo) return;
              setAssetToUnassign({ id: assetId, name: assetName });
              setConfirmUnassignOpen(true);
            }}
          >
            <Unlink className="mr-2 h-4 w-4 cursor-pointer" />
            Unassign
          </Button>
        </div>

        <AssignAssetDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          assetName={assetName}
          onAssign={handleAssign}
        />

        <AlertDialog
          open={confirmUnassignOpen}
          onOpenChange={(open) => {
            setConfirmUnassignOpen(open);
            if (!open) {
              setAssetToUnassign(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unassign asset</AlertDialogTitle>
              <AlertDialogDescription>
                {assetToUnassign ? (
                  <>
                    Are you sure you want to unassign{" "}
                    <span className="font-medium text-foreground">
                      {assetToUnassign.name}
                    </span>{" "}
                    from {assignedToName || "this user"}? The asset will be set
                    to available.
                  </>
                ) : (
                  "Are you sure you want to unassign this asset? The asset will be set to available."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive cursor-pointer"
                onClick={async () => {
                  if (!assetToUnassign) return;
                  await handleAssign(""); 
                  setConfirmUnassignOpen(false);
                  setAssetToUnassign(null);
                }}
              >
                Unassign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            Created: {formatDate(createdAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDate(updatedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}