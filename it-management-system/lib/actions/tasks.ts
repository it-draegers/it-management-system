"use server"

import { getDb } from "@/lib/mongodb"
import { getCurrentAdmin } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
})

export type Task = {
  _id: string
  title: string
  createdAt: string
  createdBy: string
  createdByName: string
  completed: boolean
}

export async function getTasks() {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()

  const tasks = await db
    .collection("tasks")
    .find({})
    .sort({ createdAt: -1 })
    .toArray()

  const mapped: Task[] = tasks.map((t: any) => ({
    _id: t._id.toString(),
    title: t.title,
    createdAt: t.createdAt?.toISOString?.() || new Date().toISOString(),
    createdBy: t.createdBy,
    createdByName: t.createdByName,
    completed: Boolean(t.completed),
  }))

  return { tasks: mapped }
}

export async function createTask(title: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  try {
    const validated = taskSchema.parse({ title })
    const db = await getDb()

    const createdById =
      (admin as any)._id?.toString?.() || (admin as any).id || "unknown"
    const createdByName =
      (admin as any).name || (admin as any).email || "Unknown user"

    await db.collection("tasks").insertOne({
      title: validated.title,
      createdAt: new Date(),
      createdBy: createdById,
      createdByName,
      completed: false,
    })

    return { success: true }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0].message }
    }
    return { error: "Failed to create task" }
  }
}

export async function deleteTask(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()

  await db.collection("tasks").deleteOne({
    _id: new ObjectId(id),
  })

  return { success: true }
}


export async function updateTask(
  id: string,
  formData: z.infer<typeof taskSchema>
) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  try {
    const validated = taskSchema.parse(formData)
    const db = await getDb()

    await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...validated,
          updatedAt: new Date(),
          updatedBy: admin._id?.toString?.() ?? null,
        },
      }
    )

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    console.error("Failed to update task", error)
    return { error: "Failed to update task" }
  }
}

export async function toggleTaskCompleted(id: string, completed: boolean) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }

  const db = await getDb()

  await db.collection("tasks").updateOne(
    { _id: new ObjectId(id) },
    { $set: { completed, updatedAt: new Date() } }
  )

  return { success: true }
}

export async function getTaskCount() {
  const db = await getDb()

  const count = await db
    .collection("tasks")
    .countDocuments({ completed: false })

  return count
}