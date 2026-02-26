"use server";

import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { de } from "date-fns/locale";

const customPropertySchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  type: z.enum([
    "Desktop",
    "Laptop",
    "Monitor",
    "Keyboard",
    "Phone",
    "Printer",
    "Tablet",
    "Server",
    "Other",
  ]),
  location: z.enum(["SSF", "MP", "LA", "Home"]),
  brand: z.string().optional().default(""),
  model: z.string().optional().default(""),
  serialNumber: z.string().optional().default(""),
  status: z
    .enum(["available", "assigned", "maintenance", "retired" , "GeneralUse"])
    .default("available"),
  purchaseDate: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  customProperties: z.array(customPropertySchema).optional().default([]),
  assignedTo: z.string().nullable().optional().default(null),
  department: z.string().optional().default(""),
});

export type Asset = {
  _id: string;
  name: string;
  type: string;
  location: "SSF" | "MP" | "LA" | "Home";
  brand: string;
  model: string;
  serialNumber: string;
  status: "available" | "assigned" | "maintenance" | "retired" | "GeneralUse";
  assignedTo: string | null;
  assignedToName?: string;
  purchaseDate: string;
  notes: string;
  customProperties: { key: string; value: string }[];
  createdAt: string;
  updatedAt: string;
  department: string;
};

export async function getAssets(params?: {
  search?: string;
  type?: string;
  status?: string;
  location?: string;
  department?: string;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  const filter: Record<string, any> = {};

  if (params?.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { serialNumber: { $regex: params.search, $options: "i" } },
      { brand: { $regex: params.search, $options: "i" } },
      { model: { $regex: params.search, $options: "i" } },
    ];
  }

  if (params?.type && params.type !== "all") {
    filter.type = params.type;
  }

  if (params?.status && params.status !== "all") {
    filter.status = params.status;
  }

  if (params?.location && params.location !== "all") {
    filter.location = params.location;
  }

  if (params?.department && params.department !== "all") {
  filter.department = params.department;   
}

  const assets = await db
    .collection("assets")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  const assetsWithNames = await Promise.all(
    assets.map(async (asset) => {
      let assignedToName: string | undefined;
      if (asset.assignedTo) {
        try {
          const user = await db
            .collection("users")
            .findOne({ _id: new ObjectId(asset.assignedTo) });
          if (user) {
            assignedToName = `${user.firstName} ${user.lastName}`;
          }
        } catch (error) {
          // Invalid ObjectId
        }
      }
      return {
        ...asset,
        _id: asset._id.toString(),
        assignedToName,
        createdAt: asset.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: asset.updatedAt?.toISOString?.() || new Date().toISOString(),
      };
    }),
  );

  return { assets: assetsWithNames as Asset[] };
}

export async function getDepartments() {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()
  const departments = await db.collection("assets").distinct("department")
  return { departments: departments.filter(Boolean) as string[] }
}


export async function getAsset(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  const asset = await db
    .collection("assets")
    .findOne({ _id: new ObjectId(id) });

  if (!asset) return { error: "Asset not found" };

  let assignedToName: string | undefined;
  if (asset.assignedTo) {
    try {
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(asset.assignedTo) });
      if (user) {
        assignedToName = `${user.firstName} ${user.lastName}`;
      }
    } catch {
      // Invalid ObjectId
    }
  }

  return {
    asset: {
      ...asset,
      _id: asset._id.toString(),
      assignedToName,
      createdAt: asset.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: asset.updatedAt?.toISOString?.() || new Date().toISOString(),
    } as Asset,
  };
}

export async function createAsset(formData: z.infer<typeof assetSchema>) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  try {
    const validated = assetSchema.parse(formData);
    const db = await getDb();

    const hasAssignee = !!validated.assignedTo;

    let finalStatus: Asset["status"];

    if (hasAssignee) {
     
      finalStatus = "assigned";
    } else {
      
      finalStatus = validated.status;
    }

    await db.collection("assets").insertOne({
      ...validated,
      status: finalStatus,          
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Failed to create asset:", error);
    return { error: "Failed to create asset" };
  }
}


export async function setAssetAvailable(assetId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  try {
    const db = await getDb();

    await db.collection("assets").updateOne(
      { _id: new ObjectId(assetId) },
      {
        $set: {
          status: "available",
          assignedTo: null,       
          updatedAt: new Date(),
        },
      },
    );
    console.log(`Asset ${assetId} set to available and unassigned`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update asset status:", error);
    return { error: "Failed to set asset to available" };
  }
}

export async function updateAsset(
  id: string,
  formData: z.infer<typeof assetSchema>,
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  try {
    const validated = assetSchema.parse(formData);
    const db = await getDb();

    await db
      .collection("assets")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...validated, updatedAt: new Date() } },
      );

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  await db.collection("assets").deleteOne({ _id: new ObjectId(id) });
  return { success: true };
}

export async function assignAsset(assetId: string, userId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  await db.collection("assets").updateOne(
    { _id: new ObjectId(assetId) },
    {
      $set: {
        assignedTo: userId,
        status: "assigned",
        updatedAt: new Date(),
      },
    },
  );

  return { success: true };
}

export async function unassignAsset(assetId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  await db.collection("assets").updateOne(
    { _id: new ObjectId(assetId) },
    {
      $set: {
        assignedTo: null,
        status: "available",
        updatedAt: new Date(),
      },
    },
  );

  return { success: true };
}

export async function getStats() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();
  const [
    totalUsers,
    totalAssets,
    assignedAssets,
    availableAssets,
    maintenanceAssets,
  ] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("assets").countDocuments(),
    db.collection("assets").countDocuments({ status: "assigned" }),
    db.collection("assets").countDocuments({ status: "available" }),
    db.collection("assets").countDocuments({ status: "maintenance" }),
    db.collection("assets").countDocuments({ status: "GeneralUse" }),
  ]);

  // Recent users
  const recentUsers = await db
    .collection("users")
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  // Recent assets
  const recentAssets = await db
    .collection("assets")
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return {
    stats: {
      totalUsers,
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      generalUseAssets: await db.collection("assets").countDocuments({ status: "GeneralUse" }),
      recentUsers: recentUsers.map((u) => ({
        ...u,
        _id: u._id.toString(),
        createdAt: u.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      recentAssets: recentAssets.map((a) => ({
        ...a,
        _id: a._id.toString(),
        createdAt: a.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
    },
  };
}
