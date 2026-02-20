import { getStats } from "@/lib/actions/assets"
import { StatsCards } from "@/components/stats-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, HardDrive } from "lucide-react"

export default async function DashboardPage() {
  const result = await getStats()

  if ("error" in result) {
    return <div className="text-destructive">{result.error}</div>
  }

  const { stats } = result

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your IT infrastructure
        </p>
      </div>

      <StatsCards
        totalUsers={stats.totalUsers}
        totalAssets={stats.totalAssets}
        assignedAssets={stats.assignedAssets}
        availableAssets={stats.availableAssets}
        maintenanceAssets={stats.maintenanceAssets}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Recent Users
              </CardTitle>
            </div>
            <CardDescription>Latest users added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No users added yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentUsers.map(
                  (user: {
                    _id: string
                    firstName: string
                    lastName: string
                    email: string
                    department: string
                    status: string
                  }) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                          className={
                            user.status === "active"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : ""
                          }
                        >
                          {user.status}
                        </Badge>
                        {user.department && (
                          <Badge variant="outline" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                Recent Assets
              </CardTitle>
            </div>
            <CardDescription>
              Latest equipment added to inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No assets added yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentAssets.map(
                  (asset: {
                    _id: string
                    name: string
                    type: string
                    status: string
                    brand: string
                  }) => (
                    <div
                      key={asset._id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {asset.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {asset.type}
                          {asset.brand ? ` - ${asset.brand}` : ""}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          asset.status === "available"
                            ? "border-success/30 bg-success/10 text-success"
                            : asset.status === "assigned"
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : asset.status === "maintenance"
                                ? "border-warning/30 bg-warning/10 text-warning"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                        }
                      >
                        {asset.status}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
