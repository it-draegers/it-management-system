"use client";

import { useState, useEffect } from "react";
import { createAsset, getAssets, type Asset } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { AssetForm } from "@/components/asset-form";
interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onAssign: (assetId: string) => Promise<void>;
}

export function AssignUserDialog({
  open,
  onOpenChange,
  userName,
  onAssign,
}: AssignUserDialogProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);

  useEffect(() => {
    if (open) {
      loadAssets();
    }
  }, [open]);

  async function loadAssets() {
    const result = await getAssets({ status: "available" });
    if ("assets" in result) {
      setAssets(result.assets ?? []);
    }
  }

  async function handleAssign() {
    if (!selectedAssetId) return;
    setLoading(true);
    await onAssign(selectedAssetId);
    setLoading(false);
    setSelectedAssetId("");
    onOpenChange(false);
  }
  async function handleCreate(data: Parameters<typeof createAsset>[0]) {
    setLoading(true);
    const result = await createAsset(data);
    setLoading(false);
    if ("error" in result && result.error) {
      throw new Error(result.error);
    }
    setShowAssetForm(false);
    loadAssets();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign an asset to{" "}
            <span className="font-medium text-foreground">{userName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Label>Select Asset</Label>
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an asset..." />
            </SelectTrigger>
            <SelectContent>
              {assets.length === 0 ? (
                <>
                  <div className="p-2 text-sm text-muted-foreground">
                    No available assets
                    <Button
                      onClick={() => setShowAssetForm(true)}
                      variant="link"
                      size="sm"
                      className="ml-2"
                    >
                      Add Asset
                    </Button>
                  </div>
                  <Dialog open={showAssetForm} onOpenChange={setShowAssetForm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Asset</DialogTitle>
                      </DialogHeader>
                      <AssetForm onSubmit={handleCreate} />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                assets.map((asset) => (
                  <SelectItem key={asset._id} value={asset._id}>
                    {asset.name}
                    {asset.type ? ` - ${asset.type}` : ""}
                    {asset.brand ? ` (${asset.brand})` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedAssetId || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
