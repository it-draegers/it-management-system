"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";

type CreateFolderInput = {
  name: string;
  parentFolderId: string;
};

type MoveFileItemInput = {
  itemId: string;
  targetFolderId: string;
};
type RenameFileItemInput = {
  itemId: string;
  newName: string;
};

export async function renameFileItem({
  itemId,
  newName,
}: RenameFileItemInput) {
  try {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      return { error: "Name is required" };
    }

    const db = await getDb();
    const collection = db.collection<FileDoc>("files");

    const item = await collection.findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return { error: "Item not found" };
    }

    const duplicate = await collection.findOne({
      _id: { $ne: item._id },
      folderId: item.folderId,
      type: item.type,
      name: trimmedName,
    });

    if (duplicate) {
      return {
        error: `A ${item.type} with that name already exists in this folder`,
      };
    }

    await collection.updateOne(
      { _id: item._id },
      {
        $set: {
          name: trimmedName,
        },
      }
    );

    revalidatePath("/dashboard/files");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to rename item" };
  }
}
type FileDoc = {
  _id?: ObjectId;
  name: string;
  type: "file" | "folder";
  folderId: ObjectId | null;
  path: string;
  size?: number;
  mimeType?: string;
  createdAt: Date;
};

function normalizeFolderId(folderId: string) {
  if (!folderId || folderId === "root") return null;
  return new ObjectId(folderId);
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-");
}

async function deleteFolderRecursive(itemId: ObjectId) {
  const db = await getDb();
  const collection = db.collection<FileDoc>("files");

  const children = await collection.find({ folderId: itemId }).toArray();

  for (const child of children) {
    if (child.type === "folder") {
      await deleteFolderRecursive(child._id!);
    } else {
      try {
        const fullPath = path.join(process.cwd(), "public", child.path.replace(/^\//, ""));
        await unlink(fullPath);
      } catch (error) {
        console.error("Failed to remove file from disk:", error);
      }

      await collection.deleteOne({ _id: child._id });
    }
  }

  await collection.deleteOne({ _id: itemId });
}

async function isDescendantFolder(
  folderId: ObjectId,
  possibleDescendantId: ObjectId
): Promise<boolean> {
  const db = await getDb();
  const collection = db.collection<FileDoc>("files");

  let current = await collection.findOne({ _id: possibleDescendantId, type: "folder" });

  while (current?.folderId) {
    if (current.folderId.toString() === folderId.toString()) {
      return true;
    }

    current = await collection.findOne({
      _id: current.folderId,
      type: "folder",
    });
  }

  return false;
}

export async function getFileItems(folderId: string) {
  const db = await getDb();
  const collection = db.collection<FileDoc>("files");

  const normalizedFolderId = normalizeFolderId(folderId);

  const items = await collection
    .find({ folderId: normalizedFolderId })
    .sort({ type: 1, name: 1 })
    .toArray();

  const breadcrumbs: { _id: string; name: string }[] = [];

  if (normalizedFolderId) {
    let currentId: ObjectId | null = normalizedFolderId;

    while (currentId) {
      const folder: FileDoc | null = await collection.findOne({
        _id: currentId,
        type: "folder",
      });

      if (!folder) break;

      breadcrumbs.unshift({
        _id: folder._id!.toString(),
        name: folder.name,
      });

      currentId = folder.folderId;
    }
  }

  return {
    items: items.map((item) => ({
      _id: item._id!.toString(),
      name: item.name,
      type: item.type,
      folderId: item.folderId ? item.folderId.toString() : null,
      path: item.path,
      size: item.size || 0,
      mimeType: item.mimeType || "",
      createdAt: item.createdAt.toISOString(),
    })),
    breadcrumbs,
  };
}

export async function getAllFolders() {
  const db = await getDb();
  const collection = db.collection<FileDoc>("files");

  const folders = await collection
    .find({ type: "folder" })
    .sort({ name: 1 })
    .toArray();

  const folderMap = new Map<string, FileDoc>();
  folders.forEach((folder) => {
    if (folder._id) {
      folderMap.set(folder._id.toString(), folder);
    }
  });

  return folders.map((folder) => {
    const parts = [folder.name];
    let currentFolderId = folder.folderId;

    while (currentFolderId) {
      const parent = folderMap.get(currentFolderId.toString());
      if (!parent) break;
      parts.unshift(parent.name);
      currentFolderId = parent.folderId;
    }

    return {
      _id: folder._id!.toString(),
      name: folder.name,
      folderId: folder.folderId ? folder.folderId.toString() : null,
      fullPath: parts.join(" / "),
    };
  });
}

export async function createFolder({ name, parentFolderId }: CreateFolderInput) {
  try {
    if (!name.trim()) {
      return { error: "Folder name is required" };
    }

    const db = await getDb();
    const collection = db.collection<FileDoc>("files");
    const folderId = normalizeFolderId(parentFolderId);

    const existing = await collection.findOne({
      name: name.trim(),
      type: "folder",
      folderId,
    });

    if (existing) {
      return { error: "A folder with this name already exists here" };
    }

    await collection.insertOne({
      name: name.trim(),
      type: "folder",
      folderId,
      path: "",
      createdAt: new Date(),
    });

    revalidatePath("/dashboard/files");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create folder" };
  }
}

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const folderId = (formData.get("folderId") as string) || "root";

    if (!file) {
      return { error: "No file selected" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const cleanName = safeFileName(file.name);
    const finalName = `${Date.now()}-${cleanName}`;
    const diskPath = path.join(uploadDir, finalName);

    await writeFile(diskPath, buffer);

    const db = await getDb();
    const collection = db.collection<FileDoc>("files");

    await collection.insertOne({
      name: file.name,
      type: "file",
      folderId: normalizeFolderId(folderId),
      path: `/uploads/${finalName}`,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date(),
    });

    revalidatePath("/dashboard/files");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to upload file" };
  }
}

export async function moveFileItem({ itemId, targetFolderId }: MoveFileItemInput) {
  try {
    const db = await getDb();
    const collection = db.collection<FileDoc>("files");

    const item = await collection.findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return { error: "Item not found" };
    }

    const targetId = normalizeFolderId(targetFolderId);

    if (item.type === "folder") {
      if (targetId && item._id && targetId.toString() === item._id.toString()) {
        return { error: "A folder cannot be moved into itself" };
      }

      if (item._id && targetId) {
        const invalidMove = await isDescendantFolder(item._id, targetId);
        if (invalidMove) {
          return { error: "You cannot move a folder inside one of its own subfolders" };
        }
      }
    }

    const duplicate = await collection.findOne({
      _id: { $ne: item._id },
      folderId: targetId,
      name: item.name,
      type: item.type,
    });

    if (duplicate) {
      return { error: `A ${item.type} with that name already exists in the target folder` };
    }

    await collection.updateOne(
      { _id: item._id },
      {
        $set: {
          folderId: targetId,
        },
      }
    );

    revalidatePath("/dashboard/files");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to move item" };
  }
}

export async function deleteFileItem(itemId: string) {
  try {
    const db = await getDb();
    const collection = db.collection<FileDoc>("files");

    const item = await collection.findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return { error: "Item not found" };
    }

    if (item.type === "folder") {
      await deleteFolderRecursive(item._id!);
    } else {
      try {
        const fullPath = path.join(process.cwd(), "public", item.path.replace(/^\//, ""));
        await unlink(fullPath);
      } catch (error) {
        console.error("Failed to delete physical file:", error);
      }

      await collection.deleteOne({ _id: item._id });
    }

    revalidatePath("/dashboard/files");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete item" };
  }
}