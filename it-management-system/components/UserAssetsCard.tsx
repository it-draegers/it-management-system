"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Computer, HardDrive, Unlink } from "lucide-react";

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

import {
  Dialog,
  DialogContent,
  DialogDescription as DialogBodyDescription,
  DialogHeader as DialogBodyHeader,
  DialogTitle as DialogBodyTitle,
} from "@/components/ui/dialog";

interface UserAssetsCardProps {
  userId: string;
  userName: string;
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

  const [chooseUnassignOpen, setChooseUnassignOpen] = useState(false);
  const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
  const [assetToUnassign, setAssetToUnassign] = useState<{
    _id: string;
    name: string;
  } | null>(null);

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

  async function handleUnassign(assetId: string): Promise<void> {
    try {
      await setAssetAvailable(assetId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  function handleUnassignClick() {
    if (assignedAssets.length === 0) return;

    if (assignedAssets.length === 1) {
      const [onlyAsset] = assignedAssets;
      setAssetToUnassign({ _id: onlyAsset._id, name: onlyAsset.name });
      setConfirmUnassignOpen(true);
    } else {
      setChooseUnassignOpen(true);
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
        {assignedAssets && assignedAssets.length > 0 ? (
          <div className="flex flex-col gap-2 ">
            {assignedAssets.map((asset) => (
              <div
                key={asset._id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    <button onClick={() => router.push(`/dashboard/assets/${asset._id}`)} className="text-blue-500 hover:underline cursor-pointer size-xl">
                    <Computer className="mr-2 inline h-4 w-4 text-muted-foreground" />
                    {asset.name}
                    </button>
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

        <div className="mt-4 flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setAssignDialogOpen(true)}
          >
            {assignedAssets.length > 0
              ? "Assign / Reassign Asset"
              : "Assign Asset"}
          </Button>

          <Button
            className="cursor-pointer"
            variant="destructive"
            size="sm"
            onClick={handleUnassignClick}
            disabled={assignedAssets.length === 0}
          >
            <Unlink className="mr-2 h-4 w-4" />
            Unassign
          </Button>
        </div>

        <AssignUserDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          userName={userName}
          onAssign={handleAssign}
        />

        <Dialog
          open={chooseUnassignOpen}
          onOpenChange={(open) => {
            setChooseUnassignOpen(open);
            if (!open) {
              setAssetToUnassign(null);
            }
          }}
        >
          <DialogContent>
            <DialogBodyHeader>
              <DialogBodyTitle>Choose asset to unassign</DialogBodyTitle>
              <DialogBodyDescription>
                Select which asset you want to unassign from {userName}.
              </DialogBodyDescription>
            </DialogBodyHeader>

            <div className="mt-2 flex flex-col gap-2">
              {assignedAssets.map((asset) => (
                <Button
                  key={asset._id}
                  type="button"
                  variant="outline"
                  className="flex w-full items-center justify-between"
                  onClick={() => {
                    setAssetToUnassign({ _id: asset._id, name: asset.name });
                    setChooseUnassignOpen(false);
                    setConfirmUnassignOpen(true);
                  }}
                >
                  <span className="text-sm font-medium">{asset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {asset.type ?? ""} {asset.brand ? `• ${asset.brand}` : ""}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

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
                    from {userName}? The asset will be set to available.
                  </>
                ) : (
                  "Are you sure you want to unassign this asset?"
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive"
                onClick={async () => {
                  if (!assetToUnassign) return;
                  await handleUnassign(assetToUnassign._id);
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