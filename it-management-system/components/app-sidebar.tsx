"use client";

import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Monitor,
  LayoutDashboard,
  Users,
  HardDrive,
  LogOut,
  ChevronUp,
  ShieldCheck,
  ListCheck,
  UserPlus,
} from "lucide-react";
import { getTaskCount } from "@/lib/actions/tasks";
import { useEffect, useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: HardDrive,
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: ListCheck,
  },
];

interface AppSidebarProps {
  adminName: string;
  adminEmail: string;
}

export function AppSidebar({ adminName, adminEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [taskCount, setTaskCount] = useState(0);
const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTaskCount() {
      const count = await getTaskCount();
      setTaskCount(count);
    }

    fetchTaskCount();
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Monitor className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Draeger's IT Management
            </span>
            <span className="text-xs text-sidebar-foreground/60"></span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                      {item.title === "Tasks" ? (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        {/* intentionally left blank: removed side-effect from render */}
                        <a href={item.url} className="flex items-center gap-2">
                          <ListCheck className="h-4 w-4" />

                          <span className="relative flex items-center">
                            {item.title}
                            {taskCount > 0 && isActive==false && (
                              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] w-4 h-4">
                                {taskCount}
                              </span>
                            )}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <a href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary/20">
                    <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-sidebar-foreground">
                      {adminName}
                    </span>
                    <span className="text-xs text-sidebar-foreground/60">
                      {adminEmail}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/register")}
                  className="text-primary focus:text-primary"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register an Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
