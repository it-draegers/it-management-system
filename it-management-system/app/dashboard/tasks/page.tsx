"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getTasks,
  createTask,
  deleteTask,
  toggleTaskCompleted,
  updateTask,
  type Task,
} from "@/lib/actions/tasks";
import {
  ClipboardList,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Circle,
  Pencil,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingLoading, setEditingLoading] = useState(false);
  const loadTasks = useCallback(async () => {
    const result = await getTasks();
    if ("tasks" in result) {
      setTasks(result.tasks ?? []);
    } else if ("error" in result && result.error) {
      setError(result.error);
    }
    setPageLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const trimmed = newTask.trim();
    if (!trimmed) {
      setError("Task title cannot be empty");
      return;
    }

    setLoading(true);
    const result = await createTask(trimmed);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setNewTask("");
    loadTasks();
  }

  async function handleDeleteTask(id: string) {
    setError("");
    const result = await deleteTask(id);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    loadTasks();
  }

  function handleStartEdit(task: Task) {
    setError("");
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  }

  async function handleSaveEdit(task: Task) {
    setError("");
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setError("Task title cannot be empty");
      return;
    }

    setEditingLoading(true);
    const result = await updateTask(task._id, { title: trimmed });
    setEditingLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    setEditingTaskId(null);
    setEditingTitle("");
    loadTasks();
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditingTitle("");
  }

  async function handleToggleCompleted(task: Task) {
    setError("");
    const result = await toggleTaskCompleted(task._id, !task.completed);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    loadTasks();
  }

  return (
    <div className="flex flex-col gap-6">
      {" "}
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
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
                className=" transition delay-150 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110  ..."
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className=" transition delay-150 duration-100 ease-in-out hover:-translate-y-1 hover:scale-110  ..."/>
                      Add
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
                        {editingTaskId === task._id ? (
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span
                            className={`font-medium ${
                              task.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Added by {task.createdByName} •{" "}
                          {new Date(task.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingTaskId === task._id ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={editingLoading}
                            onClick={() => handleSaveEdit(task)}
                          >
                            {editingLoading ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
