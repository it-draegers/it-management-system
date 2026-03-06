"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  Home,
  Loader2,
  Move,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createFolder,
  deleteFileItem,
  moveFileItem,
  uploadFile,
} from "@/lib/actions/files";

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

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string>(currentFolder);
  const [uploading, setUploading] = useState(false);

  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string>("root");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setUploadFolderId(currentFolder);
    setMovingItemId(null);
    setMoveTargetFolderId("root");
    setSearch("");
    setShowCreateFolder(false);
    setShowUpload(false);
    setSelectedFile(null);
  }, [currentFolder]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
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
      return <Folder className="h-4 w-4 text-yellow-500" />;
    }

    if (item.mimeType?.includes("pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }

    return <File className="h-4 w-4 text-muted-foreground" />;
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
      setShowCreateFolder(false);
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
      setShowUpload(false);
      setUploadFolderId(currentFolder);

      const input = document.getElementById(
        "file-upload"
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

  async function handleDelete(item: FileItem) {
    const confirmed = window.confirm(
      item.type === "folder"
        ? `Delete folder "${item.name}" and everything inside it?`
        : `Delete file "${item.name}"?`
    );

    if (!confirmed) return;

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

  async function handleMove(item: FileItem) {
    try {
      setMoving(true);

      const result = await moveFileItem({
        itemId: item._id,
        targetFolderId: moveTargetFolderId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${item.type === "folder" ? "Folder" : "File"} moved`);
      setMovingItemId(null);
      setMoveTargetFolderId("root");
      refreshPage();
    } catch (error) {
      console.error(error);
      toast.error("Failed to move item");
    } finally {
      setMoving(false);
    }
  }

  function closeUploadBox() {
    setShowUpload(false);
    setSelectedFile(null);
    setUploadFolderId(currentFolder);

    const input = document.getElementById(
      "file-upload"
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function closeCreateFolderBox() {
    setShowCreateFolder(false);
    setFolderName("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">
          Upload files, create folders, move items, download files, and organize everything.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard/files"
          className="font-medium hover:text-foreground"
        >
          <Home className="mr-1 h-5 w-5" />
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

      <div className="rounded-2xl border bg-background p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setShowCreateFolder((prev) => !prev);
              if (!showCreateFolder) {
                setShowUpload(false);
              }
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            {showCreateFolder ? "Close Folder" : "Create Folder"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setShowUpload((prev) => !prev);
              if (!showUpload) {
                setShowCreateFolder(false);
              }
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {showUpload ? "Close Upload" : "Upload File"}
          </Button>
        </div>

        {showCreateFolder && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Folder Name</label>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
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
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={closeCreateFolderBox}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {showUpload && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose File</label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="cursor-pointer w-full md:w-auto"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer w-full md:w-auto"
                  onClick={closeUploadBox}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files and folders..."
          className="max-w-md"
        />
      </div>

      <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">File Manager</h2>
        </div>

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
                          target="_blank"
                          rel="noreferrer"
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
                    {item.type === "folder" ? (
                      <Link
                        href={`/dashboard/files?folder=${item._id}`}
                        className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
                      >
                        Open
                      </Link>
                    ) : (
                      <>
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
                        >
                          View
                        </a>

                        <a
                          href={item.path}
                          download={item.name}
                          className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setMovingItemId((prev) =>
                          prev === item._id ? null : item._id
                        );
                        setMoveTargetFolderId(item.folderId ?? "root");
                      }}
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {movingItemId === item._id && (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                      <select
                        value={moveTargetFolderId}
                        onChange={(e) => setMoveTargetFolderId(e.target.value)}
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <option value="root">Root</option>
                        {allFolders
                          .filter((folder) => folder._id !== item._id)
                          .map((folder) => (
                            <option key={folder._id} value={folder._id}>
                              {folder.fullPath}
                            </option>
                          ))}
                      </select>

                      <Button
                        type="button"
                        onClick={() => handleMove(item)}
                        disabled={moving}
                        className="cursor-pointer"
                      >
                        {moving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Move className="mr-2 h-4 w-4" />
                        )}
                        Save Move
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          setMovingItemId(null);
                          setMoveTargetFolderId("root");
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground">Refreshing...</div>
      )}
    </div>
  );
}