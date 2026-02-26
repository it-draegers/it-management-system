"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { link } from "fs"
import { Users, HardDrive, Link2, CheckCircle2, Wrench } from "lucide-react"

interface StatsCardsProps {
  totalUsers: number
  totalAssets: number
  assignedAssets: number
  
}

export function StatsCards({
  totalUsers,
  totalAssets,
  assignedAssets,
 
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      link: "/dashboard/users",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Total Assets",
      value: totalAssets,
      icon: HardDrive,
      link: "/dashboard/assets",
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Assigned",
      value: assignedAssets,
      icon: Link2,
      link: "/dashboard/assets?status=assigned",
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card onClick={() => window.location.href = stat.link} key={stat.title} className="border-border cursor-pointer">
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
