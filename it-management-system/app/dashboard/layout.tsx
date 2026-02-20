import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/auth"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar adminName={admin.name} adminEmail={admin.email} />
      <SidebarInset>
        <header className="flex h-14 items-center border-b border-border bg-card px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mx-3 h-5" />
          <span className="text-sm font-medium text-muted-foreground">
            Draeger's IT Management System
          </span>
        </header>
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
