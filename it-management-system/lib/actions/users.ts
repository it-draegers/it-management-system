"use server"

import { getDb } from "@/lib/mongodb"
import { getCurrentAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { z } from "zod"

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  position: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  location: z.string().optional().default(""),
})

export type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  department: string
  location: string
  position: string
  phone: string
  status: "active" | "inactive"
  assignedAssetsCount?: number
  assignedAssets?: { _id: string; name: string }[]
  createdAt: string
  updatedAt: string
}

export async function getUsers(params?: {
  search?: string
  department?: string
  status?: string
}) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()
  const filter: Record<string, unknown> = {}

  if (params?.search) {
    filter.$or = [
      { firstName: { $regex: params.search, $options: "i" } },
      { lastName: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
    ]
  }

  if (params?.department && params.department !== "all") {
    filter.department = params.department
  }

  if (params?.status && params.status !== "all") {
    filter.status = params.status
  }

  const users = await db
    .collection("users")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray()

 const usersWithAssets = await Promise.all(
    users.map(async (user) => {
      const assets = await db
        .collection("assets")
        .find({ assignedTo: user._id.toString() })
        .project({ name: 1 }) 
        .toArray()

      const assignedAssets = assets.map((asset) => ({
        _id: asset._id.toString(),
        name: asset.name as string,
      }))

      return {
        ...user,
        _id: user._id.toString(),
        assignedAssetsCount: assignedAssets.length,
        assignedAssets,
        createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString?.() || new Date().toISOString(),
      }
    })
  )

  return { users: usersWithAssets as User[] }
}
export async function getDepartments() {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()
  const departments = await db.collection("users").distinct("department")
  return { departments: departments.filter(Boolean) as string[] }
}
export async function getLocation() {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()
  const locations = await db.collection("users").distinct("location")
  return { locations: locations.filter(Boolean) as string[] }
}

export async function createUser(formData: z.infer<typeof userSchema>) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  try {
    const validated = userSchema.parse(formData)
    const db = await getDb()

    const existing = await db
      .collection("users")
      .findOne({ email: validated.email })
    if (existing) {
      return { error: "A user with this email already exists" }
    }

    await db.collection("users").insertOne({
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create user" }
  }
}

export async function updateUser(
  id: string,
  formData: z.infer<typeof userSchema>
) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  try {
    const validated = userSchema.parse(formData)
    const db = await getDb()

    const existing = await db
      .collection("users")
      .findOne({ email: validated.email, _id: { $ne: new ObjectId(id) } })
    if (existing) {
      return { error: "A user with this email already exists" }
    }

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...validated, updatedAt: new Date() } }
      )

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to update user" }
  }
}

export async function deleteUser(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()

  // Unassign any assets assigned to this user
  await db
    .collection("assets")
    .updateMany(
      { assignedTo: id },
      { $set: { assignedTo: null, status: "available", updatedAt: new Date() } }
    )

  await db.collection("users").deleteOne({ _id: new ObjectId(id) })
  return { success: true }
}
