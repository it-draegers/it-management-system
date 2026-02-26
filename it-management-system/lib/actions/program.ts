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
  // 1. Vendor-based Clearbit logo
  if (program.vendor) {
    const domain = program.vendor.toLowerCase().replace(/\s+/g, "") + ".com";
    return `https://logo.clearbit.com/${domain}`;
  }

  // 2. Program name -> iconify
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

  const doc = {
    assetId: new ObjectId(assetId),
    name: program.name,
    version: program.version ?? null,
    vendor: program.vendor ?? null,
    logoUrl: program.logoUrl ?? guessLogoUrl(program),
    createdAt: new Date(),
    updatedAt: new Date(),
  };


  const result = await db.collection("assetPrograms").insertOne(doc);
  const createdProgram: Program = {
    _id: result.insertedId.toString(),
    name: program.name,
    version: program.version,
    vendor: program.vendor,
    logoUrl: program.logoUrl ?? guessLogoUrl(program),
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