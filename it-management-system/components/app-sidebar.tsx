"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Users,
  HardDrive,
  LogOut,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  ListCheck,
  UserPlus,
  ServerIcon,
} from "lucide-react";

import { getTaskCount } from "@/lib/actions/tasks";

const draegersNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Monitor },
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "Assets", url: "/dashboard/assets", icon: HardDrive },
  { title: "Servers", url: "/dashboard/servers", icon: ServerIcon },
  { title: "Tasks", url: "/dashboard/tasks", icon: ListCheck },
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

  const fogCityUsersUrl = "/dashboard/fog-city/users";
  const fogCityAssetsUrl = "/dashboard/fog-city/assets";

  const isFogCitySectionActive = pathname.startsWith("/dashboard/fog-city");
  const isFogCityUsersActive = pathname === fogCityUsersUrl;
  const isFogCityAssetsActive = pathname === fogCityAssetsUrl;

  const isDraegersSectionActive =
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/dashboard/fog-city");

  const [draegersOpen, setDraegersOpen] = useState<boolean>(() => isDraegersSectionActive);
  const [fogCityOpen, setFogCityOpen] = useState<boolean>(() => isFogCitySectionActive);

  useEffect(() => {
    async function fetchTaskCount() {
      const count = await getTaskCount();
      setTaskCount(count);
    }
    fetchTaskCount();
  }, []);

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      <Sidebar>
        {/* HEADER */}
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Monitor className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Draeger's IT Management
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
              Navigation
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>

                {/** ===================== DRAEGER'S MENU ===================== */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isDraegersSectionActive}
                    tooltip="Draeger's"
                  >
                    <button
                      type="button"
                      onClick={() => setDraegersOpen(!draegersOpen)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                        draegersOpen ? "bg-sidebar-primary/10" : ""
                      }`}
                    >
                      <Image
                        src="/logos/draegers.png"
                        alt="Draeger's Logo"
                        width={22}
                        height={22}
                        className="invert brightness-200 object-contain"
                      />
                      <span className="flex-1 text-left">Draeger's</span>

                      <ChevronDown
                        className={`h-4 w-4 text-sidebar-foreground/60 transition-transform ${
                          draegersOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/** Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    draegersOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="mt-1 space-y-1 pl-2 pr-1">
                    {draegersNavItems.map((item) => {
                      const isActive =
                        pathname === item.url ||
                        (item.url !== "/dashboard" && pathname.startsWith(item.url));

                      const isTasks = item.title === "Tasks";

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link
                              href={item.url}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 pl-6 text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-primary/10 transition"
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="relative flex items-center">
                                {item.title}
                                {isTasks && taskCount > 0 && !isActive && (
                                  <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {taskCount}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                </div>

                {/** ===================== FOG CITY MENU ===================== */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isFogCitySectionActive}
                    tooltip="Fog City Foods"
                  >
                    <button
                      type="button"
                      onClick={() => setFogCityOpen(!fogCityOpen)}
                      className={`mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                        fogCityOpen ? "bg-sidebar-primary/10" : ""
                      }`}
                    >
                      <Image
                        src="/logos/fog-city.png"
                        alt="Fog City Logo"
                         width={22}
                        height={22}
                        className="invert brightness-200 object-contain"
                      />

                      <span className="flex-1 text-left">Fog City Foods</span>

                      <ChevronDown
                        className={`h-4 w-4 text-sidebar-foreground/60 transition-transform ${
                          fogCityOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/** Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    fogCityOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="mt-1 space-y-1 pl-2 pr-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isFogCityUsersActive}
                        tooltip="Fog City Users"
                      >
                        <Link
                          href={fogCityUsersUrl}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 pl-6 text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-primary/10 transition"
                        >
                          <Users className="h-4 w-4" />
                          <span>Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isFogCityAssetsActive}
                        tooltip="Fog City Assets"
                      >
                        <Link
                          href={fogCityAssetsUrl}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 pl-6 text-[13px] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-primary/10 transition"
                        >
                          <HardDrive className="h-4 w-4" />
                          <span>Assets</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                </div>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/** ===================== FOOTER ===================== */}
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary/20">
                      <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
                    </div>

                    <div className="flex flex-col text-left">
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