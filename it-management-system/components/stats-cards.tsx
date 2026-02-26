"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HardDrive, Link2 } from "lucide-react";

interface StatsCardsProps {
  totalUsers: number;
  totalAssets: number;
  assignedAssets: number;
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
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.06 },
        },
      }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.22,
                  ease: "easeOut",
                  delay: index * 0.02,
                },
              },
            }}
            whileHover={{
              scale: 1.02,
              y: -2,
              boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
          >
            <Link href={stat.link} className="block">
              <Card className="border-border cursor-pointer overflow-hidden bg-background/90 backdrop-blur-sm transition-colors hover:bg-background">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-md p-1.5 ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}