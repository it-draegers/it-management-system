import { getUsers } from "@/lib/actions/users";
import { getAssets } from "@/lib/actions/assets";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const [usersRes, assetsRes] = await Promise.all([
    getUsers({ search: q }),
    getAssets({ search: q }),
  ]);

  return new Response(
    JSON.stringify({ users: usersRes.users, assets: assetsRes.assets }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}