"use client";

import { redirect, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/actions/users";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { deleteAsset } from "@/lib/actions/assets";

interface DeleteAssetButtonProps {
  assetId: string;
}

export function DeleteAssetButton({ assetId }: DeleteAssetButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    await deleteAsset(assetId);
    redirect("/dashboard/assets");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" className="cursor-pointer">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete asset</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the asset
            and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
