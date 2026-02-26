import { NextResponse } from "next/server";
import { getStats } from "@/lib/actions/assets";

export async function GET() {
  const result = await getStats();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ stats: result.stats }, { status: 200 });
}