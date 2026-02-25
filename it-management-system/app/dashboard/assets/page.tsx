"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  type Asset,
} from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetForm } from "@/components/asset-form";
import { AssignAssetDialog } from "@/components/assign-asset-dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  HardDrive,
  Link2,
  Unlink,
  Eye,
} from "lucide-react";
import Loading from "@/components/ui/loading";

const statusColors: Record<string, string> = {
  available: "border-success/30 bg-success/10 text-success",
  assigned: "border-primary/30 bg-primary/10 text-primary",
  maintenance: "border-warning/30 bg-warning/10 text-warning",
  retired: "border-destructive/30 bg-destructive/10 text-destructive",
  GeneralUse: "border-primary/30 bg-primary/10 text-primary",

};

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [assigningAsset, setAssigningAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadAssets = useCallback(async () => {
    const result = await getAssets({
      search: search || undefined,
      type: typeFilter,
      status: statusFilter,
      location: locationFilter,
    });
    if ("assets" in result) {
      setAssets(result.assets ?? []);
    }
    setPageLoading(false);
  }, [search, typeFilter, statusFilter, locationFilter]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadAssets();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, loadAssets]);

  async function handleCreate(data: Parameters<typeof createAsset>[0]) {
    setLoading(true);
    const result = await createAsset(data);
    setLoading(false);
    if ("error" in result && result.error) {
      throw new Error(result.error);
    }
    setIsCreateOpen(false);
    loadAssets();
  }

  async function handleUpdate(data: Parameters<typeof updateAsset>[1]) {
    if (!editingAsset) return;
    setLoading(true);
    const result = await updateAsset(editingAsset._id, data);
    setLoading(false);
    if ("error" in result && result.error) {
      throw new Error(result.error);
    }
    setEditingAsset(null);
    loadAssets();
  }

  async function handleDelete() {
    if (!deletingAsset) return;
    await deleteAsset(deletingAsset._id);
    setDeletingAsset(null);
    loadAssets();
  }

  async function handleAssign(userId: string) {
    if (!assigningAsset) return;
    await assignAsset(assigningAsset._id, userId);
    setAssigningAsset(null);
    loadAssets();
  }

  async function handleUnassign(assetId: string) {
    await unassignAsset(assetId);
    loadAssets();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage IT equipment and computer inventory
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, serial number, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Desktop">Desktop</SelectItem>
            <SelectItem value="Laptop">Laptop</SelectItem>
            <SelectItem value="Monitor">Monitor</SelectItem>
            <SelectItem value="Keyboard">Keyboard</SelectItem>
            <SelectItem value="Phone">Phone</SelectItem>
            <SelectItem value="Printer">Printer</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="SSF">SSF</SelectItem>
            <SelectItem value="MP">MP</SelectItem>
            <SelectItem value="LA">LA</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="GeneralUse">General Use</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">
                Brand / Model
              </TableHead>

              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">
                Assigned To
              </TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <Loading />
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <HardDrive className="h-8 w-8 text-muted-foreground/50" />
                    <p>No assets found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      Add your first asset
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/assets/${asset._id}`)}
                >
                  <TableCell className="font-medium text-foreground">
                    {asset.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.brand}
                    {asset.model ? ` ${asset.model}` : ""}
                    {!asset.brand && !asset.model ? "-" : ""}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[asset.status] || ""}
                    >
                      { asset.status === "GeneralUse" ? "General Use" : asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.assignedToName || (
                      <span className="text-muted-foreground/50">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.location || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/assets/${asset._id}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAsset(asset);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {asset.assignedTo ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassign(asset._id);
                            }}
                          >
                            <Unlink className="mr-2 h-4 w-4" />
                            Unassign
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningAsset(asset);
                            }}
                          >
                            <Link2 className="mr-2 h-4 w-4" />
                            Assign to User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingAsset(asset);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>
              Add new equipment to the IT inventory
            </DialogDescription>
          </DialogHeader>
          <AssetForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update asset information</DialogDescription>
          </DialogHeader>
          <AssetForm
            asset={editingAsset}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAsset(null)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      {assigningAsset && (
        <AssignAssetDialog
          open={!!assigningAsset}
          onOpenChange={(open) => !open && setAssigningAsset(null)}
          assetName={assigningAsset.name}
          onAssign={handleAssign}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAsset}
        onOpenChange={(open) => !open && setDeletingAsset(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingAsset?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
