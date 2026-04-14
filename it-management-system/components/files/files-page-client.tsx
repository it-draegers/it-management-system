"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  FileSpreadsheet,
  Folder,
  FolderPlus,
  Home,
  Loader2,
  Move,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createFolder,
  deleteFileItem,
  moveFileItem,
  renameFileItem,
  uploadFile,
} from "@/lib/actions/files";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialogue";

export type FileItem = {
  _id: string;
  name: string;
  type: "file" | "folder";
  folderId: string | null;
  path: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
};

type Breadcrumb = {
  _id: string;
  name: string;
};

type FolderOption = {
  _id: string;
  name: string;
  folderId: string | null;
  fullPath: string;
};

interface FilesPageClientProps {
  initialItems: FileItem[];
  breadcrumbs: Breadcrumb[];
  currentFolder: string;
  allFolders: FolderOption[];
}

export function FilesPageClient({
  initialItems,
  breadcrumbs,
  currentFolder,
  allFolders,
}: FilesPageClientProps) {
  const router = useRouter();

  const [items, setItems] = useState<FileItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string>(currentFolder);
  const [uploading, setUploading] = useState(false);

  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [movingItem, setMovingItem] = useState<FileItem | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string>("root");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setSearch("");
    setFolderName("");
    setSelectedFile(null);
    setUploadFolderId(currentFolder);
    setRenamingItemId(null);
    setRenameValue("");
    setMovingItem(null);
    setMoveTargetFolderId("root");

    setCreateDialogOpen(false);
    setUploadDialogOpen(false);
    setRenameDialogOpen(false);
    setMoveDialogOpen(false);
  }, [currentFolder]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  function refreshPage() {
    startTransition(() => {
      router.refresh();
    });
  }

  function formatFileSize(size?: number) {
    if (!size || size <= 0) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function getFileIcon(item: FileItem) {
    if (item.type === "folder") {
      return <Folder className="h-5 w-5 text-yellow-500" />;
    }

    if (item.mimeType?.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }

    if (
      item.mimeType?.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ) ||
      item.mimeType?.includes("application/vnd.ms-excel") ||
      item.name.toLowerCase().endsWith(".csv")
    ) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    }

    return <File className="h-5 w-5 text-muted-foreground" />;
  }

  async function handleCreateFolder() {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      setCreatingFolder(true);

      const result = await createFolder({
        name: folderName.trim(),
        parentFolderId: currentFolder,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Folder created");
      setFolderName("");
      setCreateDialogOpen(false);
      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please choose a file first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folderId", uploadFolderId || "root");

      const result = await uploadFile(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("File uploaded");
      setSelectedFile(null);
      setUploadFolderId(currentFolder);
      setUploadDialogOpen(false);

      const input = document.getElementById(
        "file-upload",
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  async function handleRename() {
    if (!renamingItemId) {
      toast.error("Item not found");
      return;
    }

    if (!renameValue.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      setRenaming(true);

      const result = await renameFileItem({
        itemId: renamingItemId,
        newName: renameValue.trim(),
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Name updated");
      setRenameDialogOpen(false);
      setRenamingItemId(null);
      setRenameValue("");
      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename item");
    } finally {
      setRenaming(false);
    }
  }

  async function handleMove() {
    if (!movingItem) {
      toast.error("Item not found");
      return;
    }

    try {
      setMoving(true);

      const result = await moveFileItem({
        itemId: movingItem._id,
        targetFolderId: moveTargetFolderId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `${movingItem.type === "folder" ? "Folder" : "File"} moved`,
      );
      setMoveDialogOpen(false);
      setMovingItem(null);
      setMoveTargetFolderId("root");
      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to move item");
    } finally {
      setMoving(false);
    }
  }

  async function handleDeleteConfirmed(item: FileItem) {
    try {
      const result = await deleteFileItem(item._id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(item.type === "folder" ? "Folder deleted" : "File deleted");
      setItems((prev) => prev.filter((x) => x._id !== item._id));
      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    }
  }

  function openRenameDialog(item: FileItem) {
    setRenamingItemId(item._id);
    setRenameValue(item.name);
    setRenameDialogOpen(true);
  }

  function openMoveDialog(item: FileItem) {
    setMovingItem(item);
    setMoveTargetFolderId(item.folderId ?? "root");
    setMoveDialogOpen(true);
  }

  function closeUploadDialog() {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadFolderId(currentFolder);

    const input = document.getElementById(
      "file-upload",
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function closeCreateDialog() {
    setCreateDialogOpen(false);
    setFolderName("");
  }

  function closeRenameDialog() {
    setRenameDialogOpen(false);
    setRenamingItemId(null);
    setRenameValue("");
  }

  function closeMoveDialog() {
    setMoveDialogOpen(false);
    setMovingItem(null);
    setMoveTargetFolderId("root");
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload files, create folders, rename items, move items, and organize
          everything.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/files"
            className="font-medium hover:text-foreground"
          >
            <Home className="h-5 w-5" />
          </Link>

          {breadcrumbs.map((crumb) => (
            <div key={crumb._id} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/dashboard/files?folder=${crumb._id}`}
                className="hover:text-foreground"
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="cursor-pointer">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder inside this location.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <label className="text-sm font-medium">Folder Name</label>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateFolder();
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={closeCreateDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={creatingFolder}
                  className="cursor-pointer"
                >
                  {creatingFolder ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FolderPlus className="mr-2 h-4 w-4" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Choose a file and select where to upload it.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose File</label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload To</label>
                  <select
                    value={uploadFolderId}
                    onChange={(e) => setUploadFolderId(e.target.value)}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="root">Root</option>
                    {allFolders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.fullPath}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={closeUploadDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files and folders..."
          className="max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border ">
        {filteredItems.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No files or folders found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredItems.map((item) => (
              <div key={item._id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {getFileIcon(item)}

                    <div className="min-w-0">
                      {item.type === "folder" ? (
                        <Link
                          href={`/dashboard/files?folder=${item._id}`}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <a
                          href={item.path}
                          download={item.name}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </a>
                      )}

                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.type === "folder"
                          ? `Folder • ${new Date(item.createdAt).toLocaleString()}`
                          : `${formatFileSize(item.size)} • ${
                              item.mimeType || "File"
                            } • ${new Date(item.createdAt).toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.type !== "folder" && (
                      <a
                        href={item.path}
                        download={item.name}
                        className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
                      >
                        <Download className="mr-2 h-4 w-4" />
                      </a>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => openRenameDialog(item)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => openMoveDialog(item)}
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move
                    </Button>

                    <DeleteConfirmDialog
                      title={`Delete ${item.type}`}
                      description={
                        item.type === "folder"
                          ? `Are you sure you want to delete "${item.name}"? Everything inside this folder will also be deleted.`
                          : `Are you sure you want to delete "${item.name}"?`
                      }
                      onConfirm={() => handleDeleteConfirmed(item)}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Item</DialogTitle>
            <DialogDescription>
              Update the name of this file or folder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={closeRenameDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRename}
              disabled={renaming}
              className="cursor-pointer"
            >
              {renaming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Item</DialogTitle>
            <DialogDescription>
              Choose the folder you want to move this item into.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Move To</label>
            <select
              value={moveTargetFolderId}
              onChange={(e) => setMoveTargetFolderId(e.target.value)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="root">Root</option>
              {allFolders
                .filter((folder) => folder._id !== movingItem?._id)
                .map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.fullPath}
                  </option>
                ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={closeMoveDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMove}
              disabled={moving}
              className="cursor-pointer"
            >
              {moving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Move className="mr-2 h-4 w-4" />
              )}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPending && (
        <div className="text-sm text-muted-foreground">Refreshing...</div>
      )}
    </div>
  );
}
