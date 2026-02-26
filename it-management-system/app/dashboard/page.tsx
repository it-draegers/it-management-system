import { getStats } from "@/lib/actions/assets";
import { DashboardShell } from "@/components/dashboard-shell";


export default async function DashboardPage() {
  const result = await getStats();
  
  if ("error" in result) {
    return <div className="text-destructive">{result.error}</div>;
  }

  const { stats } = result;

  return <DashboardShell stats={stats} />;
}