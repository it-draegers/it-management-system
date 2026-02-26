"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Users, HardDrive } from "lucide-react";

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

const floatLeft = {
  initial: { y: 0 },
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut",
    },
  },
};

const floatRight = {
  initial: { y: 0 },
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut",
      delay: 1.5,
    },
  },
};

interface DashboardShellProps {
  stats: DashboardStats;
}

export function DashboardShell({ stats: initialStats }: DashboardShellProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);

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

    const intervalId = setInterval(fetchStats, 10_000); 

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col gap-1"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your IT infrastructure
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12 }}
      >
        <StatsCards
          totalUsers={stats.totalUsers}
          totalAssets={stats.totalAssets}
          assignedAssets={stats.assignedAssets}
        />
      </motion.div>

      {/* Floating cards grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 6 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {/* Recent Users */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <motion.div
            variants={floatLeft}
            initial="initial"
            animate="animate"
            whileHover={{
              scale: 1.02,
              y: -2,
              boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              transition: {
                duration: 0.22,
                ease: "easeOut",
              },
            }}
            className="transition-transform"
          >
            <Card className="border-border overflow-hidden backdrop-blur-sm bg-background/90">
              <CardHeader className="border-b border-border/60 bg-muted/40">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold text-foreground">
                    Recent Users
                  </CardTitle>
                </div>
                <CardDescription>
                  Latest users added to the system
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {stats.recentUsers.length === 0 ? (
                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No users added yet
                  </motion.p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {stats.recentUsers.map((user, idx) => (
                        <motion.div
                          key={user._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{
                            duration: 0.2,
                            delay: idx * 0.05,
                          }}
                        >
                          <Link
                            href={`/dashboard/users/${user._id}`}
                            className="flex items-center justify-between rounded-lg border border-border/70 p-3 cursor-pointer bg-background/60 hover:bg-muted/80 transition-colors"
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
                                  user.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.status === "active"
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : ""
                                }
                              >
                                {user.status ?? "unknown"}
                              </Badge>
                              {user.department && (
                                <Badge variant="outline" className="text-xs">
                                  {user.department}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Assets */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <motion.div
            variants={floatRight}
            initial="initial"
            animate="animate"
            whileHover={{
              scale: 1.02,
              y: -2,
              boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              transition: {
                duration: 0.22,
                ease: "easeOut",
              },
            }}
            className="transition-transform"
          >
            <Card className="border-border overflow-hidden backdrop-blur-sm bg-background/90">
              <CardHeader className="border-b border-border/60 bg-muted/40">
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
              <CardContent className="pt-4">
                {stats.recentAssets.length === 0 ? (
                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No assets added yet
                  </motion.p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {stats.recentAssets.map((asset, idx) => (
                        <motion.div
                          key={asset._id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{
                            duration: 0.2,
                            delay: idx * 0.05,
                          }}
                        >
                          <Link
                            href={`/dashboard/assets/${asset._id}`}
                            className="flex items-center justify-between rounded-lg border border-border/70 p-3 cursor-pointer bg-background/60 hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {asset.name ?? "Unnamed asset"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {asset.type ?? "Unknown type"}
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
                                  : asset.status === "GeneralUse"
                                  ? "border-primary/30 bg-primary/10 text-primary"
                                  : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {asset.status ?? "unknown"}
                            </Badge>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}