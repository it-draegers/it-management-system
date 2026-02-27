"use server";

import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { ObjectId } from "mongodb";

export type Program = {
  _id?: string;
  name: string;
  version?: string;
  vendor?: string;
  logoUrl?: string;
};

export async function getAssetWithPrograms(assetId: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  if (!ObjectId.isValid(assetId)) {
    return { error: "Invalid asset id" };
  }

  const db = await getDb();

  const programsRaw = await db
    .collection("assetPrograms")
    .find({ assetId: new ObjectId(assetId) })
    .sort({ name: 1 })
    .toArray();

  const programs: Program[] = programsRaw.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    version: p.version ?? undefined,
    vendor: p.vendor ?? undefined,
    logoUrl: p.logoUrl ?? undefined,
  }));

  return { success: true, programs };
}
function guessLogoUrl(program: Program) {
  if (program.vendor) {
    const domain = program.vendor.toLowerCase().replace(/\s+/g, "") + ".com";
    return `https://logo.clearbit.com/${domain}`;
  }

  const slug = program.name.toLowerCase().replace(/\s+/g, "-");

  return `https://api.iconify.design/logos/${slug}.svg`;
}

export async function addProgramToAsset(assetId: string, program: Program) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  if (!ObjectId.isValid(assetId)) {
    return { error: "Invalid asset id" };
  }

  const db = await getDb();

  // 🔹 Normalize the name so we compare consistently
  const rawName = program.name ?? "";
  const normalizedName = rawName.trim();

  if (!normalizedName) {
    return { error: "Program name is required" };
  }

  const nameKey = normalizedName.toLowerCase(); // used for duplicate check

  const assetObjectId = new ObjectId(assetId);

  // 🔹 Check for duplicate by normalized name (case-insensitive)
  const existing = await db.collection("assetPrograms").findOne({
    assetId: assetObjectId,
    nameKey, // compare by normalized key
  });

  if (existing) {
    return { error: "Program already assigned to this asset" };
  }

  const logoUrl = program.logoUrl ?? guessLogoUrl(program);

  const doc = {
    assetId: assetObjectId,
    name: normalizedName,     // pretty name to display
    nameKey,                  // normalized name for duplicates
    version: program.version ?? null,
    vendor: program.vendor ?? null,
    logoUrl: logoUrl ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("assetPrograms").insertOne(doc);

  const createdProgram: Program = {
    _id: result.insertedId.toString(),
    name: normalizedName,
    version: program.version,
    vendor: program.vendor,
    logoUrl: logoUrl ?? undefined,
  };

  return { success: true, program: createdProgram };
}

export async function removeProgramFromAsset(
  assetId: string,
  programId: string,
) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();

  if (!ObjectId.isValid(assetId) || !ObjectId.isValid(programId)) {
    console.error(
      "Invalid ids passed to removeProgramFromAsset:",
      assetId,
      programId,
    );
    return { error: "Invalid ids" };
  }

  await db.collection("assetPrograms").deleteOne({
    _id: new ObjectId(programId),
    assetId: new ObjectId(assetId),
  });

  return { success: true };
}
