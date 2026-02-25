"use client"

import { useState, useEffect } from "react"
import { getUsers, type User } from "@/lib/actions/users"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// 🔍 shadcn command components
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

interface AssignAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetName: string
  onAssign: (userId: string) => Promise<void>
}

export function AssignAssetDialog({
  open,
  onOpenChange,
  assetName,
  onAssign,
}: AssignAssetDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsers()
    } else {
      // reset selection when dialog closes
      setSelectedUserId("")
    }
  }, [open])

  async function loadUsers() {
    setLoadingUsers(true)
    const result = await getUsers({ status: "active" })
    if ("users" in result) {
      setUsers(result.users)
    }
    setLoadingUsers(false)
  }

  async function handleAssign() {
    if (!selectedUserId) return
    setLoading(true)
    await onAssign(selectedUserId)
    setLoading(false)
    setSelectedUserId("")
    onOpenChange(false)
  }

  const selectedUser = users.find((u) => u._id === selectedUserId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign <span className="font-medium text-foreground">{assetName}</span> to a user.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <Label>Select User</Label>

          {loadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading users...
            </div>
          ) : (
            <Command className="border rounded-md">
              <CommandInput placeholder="Search by name, email, department..." />
              <CommandList className="max-h-64 overflow-y-auto">
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={`${user.firstName} ${user.lastName} ${user.email} ${user.department}`}
                      onSelect={() => {
                        setSelectedUserId(user._id)
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email} {user.department ? `• ${user.department}` : ""}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}

          {selectedUser && (
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}