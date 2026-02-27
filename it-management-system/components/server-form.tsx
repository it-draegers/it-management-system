"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import type { User } from "@/lib/actions/users";
import { AssignUserDialog } from "@/components/assign-user-dialogue";
import { assignAsset, unassignAsset } from "@/lib/actions/assets";
import { createServer, Server} from "@/lib/actions/servers";


interface ServerFormProps {
  server?: Server | null;
  onSubmit: (data: Parameters<typeof createServer>[0]) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export function ServerForm({ server, onSubmit, onCancel, loading }: ServerFormProps) {
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