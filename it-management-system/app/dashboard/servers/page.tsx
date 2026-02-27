// app/dashboard/servers/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  getServers,
  createServer,
  updateServer,
  deleteServer,
  type Server,
} from "@/lib/actions/servers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Server as ServerIcon,
  Globe2,
  Cpu,
  Activity,
  User as UserIcon,
} from "lucide-react";
import Loading from "@/components/ui/loading";

const statusColors: Record<string, string> = {
  online: "border-success/30 bg-success/10 text-success",
  maintenance: "border-warning/30 bg-warning/10 text-warning",
  offline: "border-destructive/30 bg-destructive/10 text-destructive",
  decommissioned: "border-muted/40 bg-muted/20 text-muted-foreground",
};

const envColors: Record<string, string> = {
  Production: "border-primary/30 bg-primary/10 text-primary",
  Development: "border-chart-2/40 bg-chart-2/10 text-chart-2",
};

const MotionTableRow = motion(TableRow);

// ---------------- Server Form ----------------

interface ServerFormProps {
  server?: Server | null;
  onSubmit: (data: Parameters<typeof createServer>[0]) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

function ServerForm({ server, onSubmit, onCancel, loading }: ServerFormProps) {
  const [name, setName] = useState(server?.name ?? "");
  const [ipAddress, setIpAddress] = useState(server?.ipAddress ?? "");
  const [role, setRole] = useState(server?.role ?? "");
  const [environment, setEnvironment] = useState(
    server?.environment ?? "Production",
  );
  const [status, setStatus] = useState(server?.status ?? "online");
  const [os, setOs] = useState(server?.os ?? "");
  const [location, setLocation] = useState(server?.location ?? "");
  const [owner, setOwner] = useState(server?.owner ?? "");
  const [notes, setNotes] = useState(server?.notes ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !ipAddress.trim()) {
      setError("Name and IP address are required");
      return;
    }
    setError("");

    await onSubmit({
      name: name.trim(),
      ipAddress: ipAddress.trim(),
      role: role.trim() || undefined,
      environment,
      status,
      os: os.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Server Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PROD-SQL-01"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            IP Address *
          </label>
          <Input
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="e.g. 10.0.0.15"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Role
          </label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Database, Domain Controller"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Environment
          </label>
          <Select
            value={environment}
            onValueChange={(v) => setEnvironment(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Operating System
          </label>
          <Input
            value={os}
            onChange={(e) => setOs(e.target.value)}
            placeholder="e.g. Windows Server"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Location
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. SSF, MP, etc."
          />
        </div>
        
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Anything special about this server "
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="cursor-pointer"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Server"}
        </Button>
      </div>
    </form>
  );
}

// ---------------- Main Page ----------------

export default function ServersPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [search, setSearch] = useState("");
  const [envFilter, setEnvFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deletingServer, setDeletingServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadServers = useCallback(async () => {
    const result = await getServers({
      search: search || undefined,
      environment: envFilter,
      status: statusFilter,
      location: locationFilter,
    });

    if ("servers" in result) {
      setServers(result.servers ?? []);
    } else {
      setServers([]);
    }
    setPageLoading(false);
  }, [search, envFilter, statusFilter, locationFilter]);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadServers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, loadServers]);

  async function handleCreate(data: Parameters<typeof createServer>[0]) {
    setLoading(true);
    const result = await createServer(data);
    setLoading(false);
    if ("error" in result && result.error) {
      throw new Error(result.error);
    }
    setIsCreateOpen(false);
    loadServers();
  }

  async function handleUpdate(data: Parameters<typeof updateServer>[1]) {
    if (!editingServer) return;
    setLoading(true);
    const result = await updateServer(editingServer._id, data);
    setLoading(false);
    if ("error" in result && result.error) {
      throw new Error(result.error);
    }
    setEditingServer(null);
    loadServers();
  }

  async function handleDelete() {
    if (!deletingServer) return;
    await deleteServer(deletingServer._id);
    setDeletingServer(null);
    loadServers();
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div>
          <h1 className="flex items-center text-2xl font-bold text-foreground">
            <ServerIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            Servers
          </h1>
          <p className="text-sm text-muted-foreground">
            Central view of all servers, roles, IPs, and environments
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.12 }}
        >
          <Button
            className="cursor-pointer"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, IP, role, OS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={envFilter} onValueChange={setEnvFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="Production">Production</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="decommissioned">Decommissioned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="SSF">SSF</SelectItem>
            <SelectItem value="MP">MP</SelectItem>
            <SelectItem value="LA">LA</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-lg border border-border"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.14 }}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">Server</TableHead>
              <TableHead className="text-muted-foreground">IP Address</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Environment</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">OS</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  <Loading />
                </TableCell>
              </TableRow>
            ) : servers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ServerIcon className="h-8 w-8 text-muted-foreground/50" />
                    <p>No servers found</p>
                    
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence initial={false}>
                {servers.map((server, index) => (
                  <MotionTableRow
                    key={server._id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/servers/${server._id}`)
                    }
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.18,
                      delay: index * 0.015,
                    }}
                    whileHover={{
                      backgroundColor: "rgba(148,163,184,0.08)",
                    }}
                  >
                    <TableCell className="font-medium text-foreground">
                      <Cpu className="mr-2 inline h-4 w-4 text-muted-foreground" />
                      {server.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-foreground">
                      <Globe2 className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      {server.ipAddress || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {server.role || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          envColors[server.environment ?? ""] || ""
                        }`}
                      >
                        {server.environment || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs flex items-center gap-1 ${
                          statusColors[server.status ?? ""] || ""
                        }`}
                      >
                        <Activity className="h-3 w-3" />
                        {server.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {server.os || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {server.location || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {server.owner ? (
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {server.owner}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">-</span>
                      )}
                    </TableCell>
                    <TableCell
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingServer(server);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingServer(server);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Add New Server</DialogTitle>
            <DialogDescription>
              Add a server to your infrastructure inventory
            </DialogDescription>
          </DialogHeader>
          <ServerForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingServer}
        onOpenChange={(open) => !open && setEditingServer(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
            <DialogDescription>Update server information</DialogDescription>
          </DialogHeader>
          <ServerForm
            server={editingServer}
            onSubmit={handleUpdate}
            onCancel={() => setEditingServer(null)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingServer}
        onOpenChange={(open) => !open && setDeletingServer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deletingServer?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}