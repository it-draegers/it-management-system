"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getTasks,
  createTask,
  deleteTask,
  toggleTaskCompleted,
  type Task,
} from "@/lib/actions/tasks"
import {
  ClipboardList,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    const result = await getTasks()
    if ("tasks" in result) {
      setTasks(result.tasks)
    } else if ("error" in result && result.error) {
      setError(result.error)
    }
    setPageLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const trimmed = newTask.trim()
    if (!trimmed) {
      setError("Task title cannot be empty")
      return
    }

    setLoading(true)
    const result = await createTask(trimmed)
    setLoading(false)

    if ("error" in result && result.error) {
      setError(result.error)
      return
    }

    setNewTask("")
    loadTasks()
  }

  async function handleDeleteTask(id: string) {
    setError("")
    const result = await deleteTask(id)
    if ("error" in result && result.error) {
      setError(result.error)
      return
    }
    loadTasks()
  }

  async function handleToggleCompleted(task: Task) {
    setError("")
    const result = await toggleTaskCompleted(task._id, !task.completed)
    if ("error" in result && result.error) {
      setError(result.error)
      return
    }
    loadTasks()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Add, complete, and remove tasks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
          {/* Add task */}
          <section className="rounded-lg border border-border bg-muted/30 p-4">
            {error && (
              <div className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              onSubmit={handleAddTask}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                placeholder="Enter a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="bg-background"
              />
              <Button
                type="submit"
                className="sm:w-auto w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </>
                )}
              </Button>
            </form>
          </section>

          {/* Task list */}
          <section className="flex-1 rounded-lg border border-border bg-muted/10 p-4">
            {pageLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mb-1 h-6 w-6 text-muted-foreground/60" />
                <p>No tasks yet</p>
               
              </div>
            ) : (
              <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-0.5"
                        onClick={() => handleToggleCompleted(task)}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            task.completed
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Added by {task.createdByName} •{" "}
                          {new Date(task.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
