"use server";

import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { parse } from "csv-parse/sync";

type CsvRow = {
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  status?: string;
  department?: string;
  location?: string;
};

export async function importUsersFromCsv(formData: FormData) {
  const admin = await getCurrentAdmin?.();
  if (admin === null || admin === undefined) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "No file uploaded" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    
    const rows = parse(buffer, {
      columns: (header: string[]) =>
        header.map((h) =>
          h.replace(/\ufeff/g, "").trim().toLowerCase(),
        ),
      skip_empty_lines: true,
      trim: true,
    }) as CsvRow[];

    const db = await getDb();
    const usersCollection = db.collection("users");

    let importedCount = 0;
    let skippedCount = 0;

    

    for (const row of rows) {
      const rawEmail = (row.email || "").toString().trim();
      if (!rawEmail) {
        skippedCount++;
        continue;
      }

      const email = rawEmail.toLowerCase();

      
      let firstName = "";
      let lastName = "";

      if (row.name) {
        const parts = row.name.toString().trim().split(/\s+/);
        firstName = parts.shift() || "";
        lastName = parts.join(" ") || "";
      } else {
        firstName = (row.firstname || "").toString().trim();
        lastName = (row.lastname || "").toString().trim();
      }

      const status =
        (row.status || "").toString().trim().toLowerCase() || "active";

      const userDoc = {
        firstName,
        lastName,
        email,
        status, 
        department: (row.department || "").toString().trim(),
        location: (row.location || "").toString().trim(),
        updatedAt: new Date(),
      };

      await usersCollection.updateOne(
        { email },
        {
          $set: userDoc,
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      importedCount++;
    }

    return { success: true, imported: importedCount, skipped: skippedCount };
  } catch (err) {
    console.error("CSV import failed:", err);
    return { error: "Failed to import users from CSV" };
  }
}