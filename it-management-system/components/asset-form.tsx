"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import type { Asset } from "@/lib/actions/assets";

interface AssetFormProps {
  asset?: Asset | null;
  onSubmit: (data: {
    _id(_id: any, asset: {
      name: string; type: "Desktop" |
        "Laptop" |
        "Monitor" |
        "Keyboard" |
        "Phone" |
        "Printer" |
        "Other"; brand: string; location: "MP" | "LA" | "SSF" | "Home"; model: string; serialNumber: string; status: "available" | "assigned" | "maintenance" | "retired"; purchaseDate: string; notes: string; customProperties: { key: string; value: string; }[];
    }): unknown;
    name: string;
    type:
      | "Desktop"
      | "Laptop"
      | "Monitor"
      | "Keyboard"
      | "Phone"
      | "Printer"
      | "Other";
    brand: string;
    location: "MP" | "LA" | "SSF" | "Home";
    model: string;
    serialNumber: string;
    status: "available" | "assigned" | "maintenance" | "retired";
    purchaseDate: string;
    notes: string;
    customProperties: { key: string; value: string }[];
  }) => Promise<void>;
  onCancel?: () => void           
  loading?: boolean;
}
const locations = ["MP", "LA", "SSF", "Home"];

const assetTypes = [
  "Desktop",
  "Laptop",
  "Monitor",
  "Keyboard",
  "Phone",
  "Printer",
  "Other",
] as const;

export function AssetForm({
  asset,
  onSubmit,
  onCancel,
  loading,
}: AssetFormProps) {
  const [error, setError] = useState("");
  const [customProperties, setCustomProperties] = useState<
    { key: string; value: string }[]
  >(asset?.customProperties || []);
  const router = useRouter();

  function addProperty() {
    setCustomProperties([...customProperties, { key: "", value: "" }]);
  }

  function removeProperty(index: number) {
    setCustomProperties(customProperties.filter((_, i) => i !== index));
  }

  function updateProperty(
    index: number,
    field: "key" | "value",
    value: string,
  ) {
    const updated = [...customProperties];
    updated[index][field] = value;
    setCustomProperties(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await onSubmit({
        name: formData.get("name") as string,
        type: formData.get("type") as AssetFormProps["onSubmit"] extends (
          data: infer D
        ) => unknown ? D extends { type: infer T; } ? T : never : never,
        brand: (formData.get("brand") as string) || "",
        model: (formData.get("model") as string) || "",
        serialNumber: (formData.get("serialNumber") as string) || "",
        status: (formData.get("status") as "available" |
          "assigned" |
          "maintenance" |
          "retired") || "available",
        purchaseDate: (formData.get("purchaseDate") as string) || "",
        location: (formData.get("location") as "MP" | "LA" | "SSF" | "Home") || null,

        notes: (formData.get("notes") as string) || "",
        customProperties: customProperties.filter((p) => p.key.trim()),
        _id: function (_id: any, asset: {
          name: string; type: "Desktop" |
          "Laptop" |
          "Monitor" |
          "Keyboard" |
          "Phone" |
          "Printer" |
          "Other"; brand: string; location: "MP" | "LA" | "SSF" | "Home"; model: string; serialNumber: string; status: "available" | "assigned" | "maintenance" | "retired"; purchaseDate: string; notes: string; customProperties: { key: string; value: string; }[];
        }): unknown {
          throw new Error("Function not implemented.");
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Asset Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={asset?.name || ""}
            required
            placeholder="MacBook Pro 16"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={asset?.type || "Laptop"}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {assetTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            defaultValue={asset?.brand || ""}
            placeholder="Apple"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            name="model"
            defaultValue={asset?.model || ""}
            placeholder="A2141"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            defaultValue={asset?.serialNumber || ""}
            placeholder="SN-12345-ABCDE"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Select name="location" defaultValue={asset?.location || undefined}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={asset?.status || "available"}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          defaultValue={asset?.purchaseDate || ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={asset?.notes || ""}
          placeholder="Additional notes about this asset..."
          rows={2}
        />
      </div>

      {/* Custom Properties */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Custom Properties</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProperty}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Property
          </Button>
        </div>
        {customProperties.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
            {customProperties.map((prop, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Key (e.g. RAM)"
                  value={prop.key}
                  onChange={(e) => updateProperty(index, "key", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g. 16GB)"
                  value={prop.value}
                  onChange={(e) =>
                    updateProperty(index, "value", e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeProperty(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline"  onClick={() => {
            if (onCancel) onCancel()
            else router.back()     // 👈 default cancel behavior
          }}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : asset ? (
            "Update Asset"
          ) : (
            "Add Asset"
          )}
        </Button>
      </div>
    </form>
  );
}
