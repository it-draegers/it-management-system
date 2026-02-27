"use server";

import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serialize } from "v8";

// ---------- Types ----------

export type Server = {
  _id: string;
  name: string;
  ipAddress: string;
  role?: string;
  environment?: "Production" | "Staging" | "Development" | "Lab" | string;
  status?: "online" | "maintenance" | "offline" | "decommissioned" | string;
  os?: string;
  location?: string;
  owner?: string;
  notes?: string;
  serialNumber?: string;

  createdAt?: Date;
  updatedAt?: Date;
};

const serverSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  ipAddress: z.string().min(1, "IP address is required"),
  role: z.string().optional(),
  environment: z
    .enum(["Production", "Staging", "Development", "Lab"])
    .default("Production"),
  status: z
    .enum(["online", "maintenance", "offline", "decommissioned"])
    .default("online"),
  os: z.string().optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  owner: z.string().optional(),
  notes: z.string().optional(),
});

type CreateServerInput = z.infer<typeof serverSchema>;
type UpdateServerInput = CreateServerInput;

export type GetServersParams = {
  search?: string;
  environment?: string;
  status?: string;
  location?: string;
};

// ---------- Helpers ----------

function mapServer(doc: any): Server {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    ipAddress: doc.ipAddress,
    role: doc.role,
    environment: doc.environment,
    status: doc.status,
    os: doc.os,
    location: doc.location,
    owner: doc.owner,
    notes: doc.notes,
    serialNumber: doc.serialNumber,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ---------- Actions ----------

export async function getServers(params: GetServersParams) {
  try {
    const db = await getDb();

    const filters: any = {};

    // Search across name, ipAddress, role, os, owner
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      filters.$or = [
        { name: { $regex: q, $options: "i" } },
        { ipAddress: { $regex: q, $options: "i" } },
        { role: { $regex: q, $options: "i" } },
        { os: { $regex: q, $options: "i" } },
        { owner: { $regex: q, $options: "i" } },
      ];
    }

    if (params.environment && params.environment !== "all") {
      filters.environment = params.environment;
    }

    if (params.status && params.status !== "all") {
      filters.status = params.status;
    }

    if (params.location && params.location !== "all") {
      filters.location = params.location;
    }

    const docs = await db
      .collection("servers")
      .find(filters)
      .sort({ createdAt: -1 })
      .toArray();

    const servers = docs.map(mapServer);

    return { servers };
  } catch (err) {
    console.error("getServers error:", err);
    return { error: "Unable to fetch servers" };
  }
}

export async function createServer(data: CreateServerInput) {
  try {
    const validated = serverSchema.parse(data);
    const db = await getDb();

    const now = new Date();

    const result = await db.collection("servers").insertOne({
      ...validated,
      createdAt: now,
      updatedAt: now,
    });

    if (!result.insertedId) {
      return { error: "Failed to create server" };
    }

    // You’re only checking for `error` on the client,
    // so returning success is enough.
    return { success: true };
  } catch (err) {
    console.error("createServer error:", err);
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message ?? "Invalid server data" };
    }
    return { error: "Failed to create server" };
  }
}

export async function updateServer(id: string, data: UpdateServerInput) {
  try {
    const validated = serverSchema.parse(data);
    const db = await getDb();

    const result = await db.collection("servers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...validated,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { error: "Server not found" };
    }

    return { success: true };
  } catch (err) {
    console.error("updateServer error:", err);
    if (err instanceof z.ZodError) {
      return { error: err.issues[0]?.message ?? "Invalid server data" };
    }
    return { error: "Failed to update server" };
  }
}

export async function deleteServer(id: string) {
  try {
    const db = await getDb();

    const result = await db
      .collection("servers")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { error: "Server not found" };
    }

    return { success: true };
  } catch (err) {
    console.error("deleteServer error:", err);
    return { error: "Failed to delete server" };
  }
}

export async function getServer(id: string) {
  try {
    const db = await getDb();
    const doc = await db
      .collection("servers")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return { error: "Server not found" };
    }

    return { server: mapServer(doc) };
  } catch (err) {
    console.error("getServer error:", err);
    return { error: "Failed to fetch server" };
  }
}
