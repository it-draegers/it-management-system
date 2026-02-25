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

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    status: "active" | "inactive";
    location: string;
    employeeId: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const departments = [
  "Wine",
  "Meat",
  "Grocery",
  "Marketing",
  "HR",
  "Accounting",
  "Owners",
  "IT",
  "Bakery",
  "Housewares",
  "Deli",
  "Loss Prevention",
  "Sales",
];

const locations = ["MP", "LA", "SSF", "Home/Remote"];

export function UserForm({ user, onSubmit, onCancel, loading }: UserFormProps) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [selected, setSelected] = useState(user?.department || "");
  const [custom, setCustom] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  async function handleAssign(assetId: string): Promise<void> {
    if (!user?._id) return; 

    try {
      await assignAsset(assetId, user._id);
      router.refresh(); 
    } catch (err) {
      console.error(err);
      setError("Failed to assign asset");
    } finally {
      setAssignDialogOpen(false);
      router.push(`/dashboard/users/${user._id}`); 
    }
  }

  function handleSelect(val: string) {
    setSelected(val);
    if (val !== "Other") setCustom("");
  }

  function handleCustom(val: string) {
    setCustom(val);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await onSubmit({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        location: formData.get("location") as string,
        department: (formData.get("department") as string) || "",
        position: (formData.get("position") as string) || "",
        phone: (formData.get("phone") as string) || "",
        status: (formData.get("status") as "active" | "inactive") || "active",
        employeeId: (formData.get("employeeId") as string) || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const assignedAssets = user?.assignedAssets ?? [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName || ""}
            required
            placeholder="John"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName || ""}
            required
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email || ""}
          required
          placeholder="john@company.com"
        />
      </div>

      {/* Department / Location / Position */}
      <div className="grid grid-cols-2 gap-4">
        {/* Department */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="department">Department</Label>
          <Select
            onValueChange={handleSelect}
            defaultValue={selected || undefined}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Single source of truth for department form value */}
          <input
            type="hidden"
            name="department"
            value={selected === "Other" ? custom : selected}
            readOnly
          />

          {selected === "Other" && (
            <Input
              placeholder="Enter department"
              value={custom}
              onChange={(e) => handleCustom(e.target.value)}
            />
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Select name="location" defaultValue={user?.location || undefined}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            defaultValue={user?.position || ""}
            placeholder="Position"
          />
        </div>
      </div>

              <div className="flex flex-col gap-2">
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            name="employeeId"
            defaultValue={user?.employeeId || ""}
            placeholder="Employee ID"
          />
        </div>
      


      {/* Phone */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={user?.phone || ""}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {/* Assigned assets + Status */}
      <div className="flex items-start justify-between gap-6">
        {/* Assigned Assets area */}
        <div className="flex flex-col gap-2">
          <Label>Assigned Assets</Label>

          {assignedAssets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedAssets.map((asset) => (
                <div
                  key={asset._id}
                  className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1"
                >
                  <Badge variant="outline" className="text-xs">
                    {asset.name}
                  </Badge>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={async () => {
                      try {
                        await unassignAsset(asset._id);
                        router.refresh();
                      } catch (err) {
                        console.error(err);
                        setError("Failed to unassign asset");
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No assets assigned</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setAssignDialogOpen(true)}
          >
            {assignedAssets.length > 0 ? "Assign / Reassign Asset" : "Assign Asset"}
          </Button>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={user?.status || "active"}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assign asset dialog (choose asset for this user) */}
      {user && (
        <AssignUserDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          userName={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
          onAssign={handleAssign}
        />
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button className="cursor-pointer" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : user ? (
            "Update User"
          ) : (
            "Add User"
          )}
        </Button>
      </div>
    </form>
  );
}