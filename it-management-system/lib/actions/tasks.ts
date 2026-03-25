"use server";

import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
});

export type Task = {
  _id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  completed: boolean;
  order: number;
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
};

export async function getTasks() {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();

  const tasks = await db
    .collection("tasks")
    .find({})
    .sort({ order: 1 })
    .toArray();

  const mapped: Task[] = tasks.map((t: any) => ({
    _id: t._id.toString(),
    title: t.title,
    createdAt: t.createdAt?.toISOString?.() || new Date().toISOString(),
    createdBy: t.createdBy,
    createdByName: t.createdByName,
    completed: Boolean(t.completed),
    order: t.order ?? 0,
    updatedAt: t.updatedAt?.toISOString?.(),
    updatedBy: t.updatedBy,
    updatedByName: t.updatedByName,
  }));

  return { tasks: mapped };
}

export async function createTask(title: string) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  try {
    const validated = taskSchema.parse({ title });
    const db = await getDb();

    const createdById =
      (admin as any)._id?.toString?.() || (admin as any).id;

    const createdByName =
      (admin as any).name || (admin as any).email;

    const firstTask = await db
      .collection("tasks")
      .find({})
      .sort({ order: 1 })
      .limit(1)
      .toArray();

    const newOrder =
      firstTask.length > 0 ? firstTask[0].order - 1 : 0;

    await db.collection("tasks").insertOne({
      title: validated.title,
      createdAt: new Date(),
      createdBy: createdById,
      createdByName,
      completed: false,
      order: newOrder,
      updatedAt: null,
      updatedBy: null,
      updatedByName: null,
    });

    return { success: true };
  } catch (err) {
    return { error: "Failed to create task" };
  }
}

export async function updateTask(id: string, formData: any) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();

  const updatedById =
    (admin as any)._id?.toString?.() || (admin as any).id;

  const updatedByName =
    (admin as any).name || (admin as any).email;

  await db.collection("tasks").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title: formData.title,
        updatedAt: new Date(),
        updatedBy: updatedById,
        updatedByName,
      },
    }
  );

  return { success: true };
}

export async function toggleTaskCompleted(id: string, completed: boolean) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized" };

  const db = await getDb();

  const updatedByName =
    (admin as any).name || (admin as any).email;

  await db.collection("tasks").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        completed,
        updatedAt: new Date(),
        updatedByName,
      },
    }
  );

  return { success: true };
}

export async function reorderTasks(updatedTasks: any[]) {
  const db = await getDb();

  const bulkOps = updatedTasks.map((task) => ({
    updateOne: {
      filter: { _id: new ObjectId(task._id) },
      update: { $set: { order: task.order } },
    },
  }));

  await db.collection("tasks").bulkWrite(bulkOps);

  return { success: true };
}

export async function deleteTask(id: string) {
  const db = await getDb();

  await db.collection("tasks").deleteOne({
    _id: new ObjectId(id),
  });

  return { success: true };
}
export async function getTaskCount() {
  const db = await getDb();

  const count = await db
    .collection("tasks")
    .countDocuments({ completed: false });

  return count;
}