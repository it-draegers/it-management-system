"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { StatsCards } from "@/components/stats-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, HardDrive, Search } from "lucide-react";

type DashboardStats = {
  totalUsers: number;
  totalAssets: number;
  assignedAssets: number;
  recentUsers: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    department?: string;
    status?: string;
  }[];
  recentAssets: {
    _id: string;
    name?: string;
    type?: string;
    status?: string;
    brand?: string;
  }[];
};

interface DashboardShellProps {
  stats: DashboardStats;
}

export function DashboardShell({ stats: initialStats }: DashboardShellProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [search, setSearch] = useState("");

  const isSearching = search.trim().length > 0;

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (isMounted && data.stats) {
          setStats(data.stats as DashboardStats);
        }
      } catch (err) {
        console.error("Failed to refresh stats", err);
      }
    }

    fetchStats();

    const interval = setInterval(fetchStats, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredUsers = stats.recentUsers.filter((user) => {
    const q = search.toLowerCase();

    return (
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.department?.toLowerCase().includes(q)
    );
  });

  const filteredAssets = stats.recentAssets.filter((asset) => {
    const q = search.toLowerCase();

    return (
      asset.name?.toLowerCase().includes(q) ||
      asset.type?.toLowerCase().includes(q) ||
      asset.brand?.toLowerCase().includes(q) ||
      asset.status?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <p className="text-sm text-muted-foreground">
          Overview of IT infrastructure
        </p>

        {/* SEARCH */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search users or assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* NORMAL DASHBOARD */}
      {!isSearching && (
        <>
          <StatsCards
            totalUsers={stats.totalUsers}
            totalAssets={stats.totalAssets}
            assignedAssets={stats.assignedAssets}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* RECENT USERS */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest users added</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {stats.recentUsers.map((user) => (
                  <Link
                    key={user._id}
                    href={`/dashboard/users/${user._id}`}
                    className="flex justify-between rounded-lg border p-3 hover:bg-muted/70"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>

                    <Badge>{user.status ?? "unknown"}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* RECENT ASSETS */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>Latest assets added</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {stats.recentAssets.map((asset) => (
                  <Link
                    key={asset._id}
                    href={`/dashboard/assets/${asset._id}`}
                    className="flex justify-between rounded-lg border p-3 hover:bg-muted/70"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {asset.name ?? "Unnamed asset"}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {asset.type ?? "Unknown type"}
                      </span>
                    </div>

                    <Badge variant="outline">
                      {asset.status ?? "unknown"}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* SEARCH RESULTS */}
      {isSearching && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* USERS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <CardTitle>Users</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No matching users
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <Link
                    key={user._id}
                    href={`/dashboard/users/${user._id}`}
                    className="flex justify-between rounded-lg border p-3 hover:bg-muted/70"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>

                    <Badge>{user.status ?? "unknown"}</Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* ASSETS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <CardTitle>Assets</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {filteredAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No matching assets
                </p>
              ) : (
                filteredAssets.map((asset) => (
                  <Link
                    key={asset._id}
                    href={`/dashboard/assets/${asset._id}`}
                    className="flex justify-between rounded-lg border p-3 hover:bg-muted/70"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {asset.name ?? "Unnamed asset"}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {asset.type ?? "Unknown type"}
                      </span>
                    </div>

                    <Badge variant="outline">
                      {asset.status ?? "unknown"}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}