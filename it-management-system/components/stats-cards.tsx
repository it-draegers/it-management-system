import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, HardDrive, Link2, CheckCircle2, Wrench } from "lucide-react"

interface StatsCardsProps {
  totalUsers: number
  totalAssets: number
  assignedAssets: number
  availableAssets: number
  maintenanceAssets: number
}

export function StatsCards({
  totalUsers,
  totalAssets,
  assignedAssets,
  availableAssets,
  maintenanceAssets,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Total Assets",
      value: totalAssets,
      icon: HardDrive,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Assigned",
      value: assignedAssets,
      icon: Link2,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    {
      title: "Available",
      value: availableAssets,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Maintenance",
      value: maintenanceAssets,
      icon: Wrench,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-md p-1.5 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
