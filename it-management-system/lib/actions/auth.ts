"use server"

import { getDb } from "@/lib/mongodb"
import {
  hashPassword,
  verifyPassword,
  createToken,
  setAuthCookie,
  removeAuthCookie,
} from "@/lib/auth"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function register(formData: {
  name: string
  email: string
  password: string
}) {
  try {
    const validated = registerSchema.parse(formData)
    const db = await getDb()

    const existing = await db
      .collection("admins")
      .findOne({ email: validated.email })
    if (existing) {
      return { error: "An account with this email already exists" }
    }

    const hashedPassword = await hashPassword(validated.password)
    const result = await db.collection("admins").insertOne({
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    const token = await createToken({
      id: result.insertedId.toString(),
      email: validated.email,
      name: validated.name,
      _id: undefined
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

export async function login(formData: { email: string; password: string }) {
  try {
    const validated = loginSchema.parse(formData)
    const db = await getDb()

    const admin = await db
      .collection("admins")
      .findOne({ email: validated.email })
    if (!admin) {
      return { error: "Invalid email or password" }
    }

    const isValid = await verifyPassword(validated.password, admin.password)
    if (!isValid) {
      return { error: "Invalid email or password" }
    }

    const token = await createToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      _id: undefined
    })

    await setAuthCookie(token)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Something went wrong. Please try again." }
  }
}

export async function logout() {
  await removeAuthCookie()
  return { success: true }
}
