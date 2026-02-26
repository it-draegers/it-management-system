"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { importUsersFromCsv } from "@/lib/actions/user-import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ImportUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResultMsg("");

    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const result = await importUsersFromCsv(formData);

      if ("error" in result && result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setResultMsg(
        `Imported ${result.imported} users${
          result.skipped ? `, skipped ${result.skipped} row(s)` : ""
        }.`
      );

      
    } catch (err) {
      console.error(err);
      setError("Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Import Users from CSV</h1>
      <p className="text-sm text-muted-foreground">
        Upload a <strong>.csv</strong> file with columns like:
        <code className="ml-1">name,email,status,department,location</code>.
      </p>

      {error && (
        <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {resultMsg && (
        <div className="rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">
          {resultMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || !file}>
            {loading ? "Importing..." : "Import Users"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}