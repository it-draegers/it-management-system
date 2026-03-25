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
  reorderTasks,
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
  GripVertical,
  Info,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import Loading from "@/components/ui/loading";
import { toast } from "sonner";

function SortableTask({
  task,
  children,
}: {
  task: Task;
  children: (dragHandleProps: any) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners)}
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

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
    const trimmed = newTask.trim();
    if (!trimmed) return;

    setLoading(true);
    const result = await createTask(trimmed);
    setLoading(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    toast.success("Task added");
    setNewTask("");
    loadTasks();
  }

  async function handleDeleteTask(id: string) {
    await deleteTask(id);
    toast.success("Task deleted");
    loadTasks();
  }

  function handleStartEdit(task: Task) {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
  }

  async function handleSaveEdit(task: Task) {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    await updateTask(task._id, { title: trimmed });

    toast.success("Task updated");
    setEditingTaskId(null);
    setEditingTitle("");
    loadTasks();
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditingTitle("");
  }

  async function handleToggleCompleted(task: Task) {
    await toggleTaskCompleted(task._id, !task.completed);

    toast.success(
      task.completed ? "Marked incomplete" : "Marked complete"
    );

    loadTasks();
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    setTasks(newTasks);

    await reorderTasks(
      newTasks.map((task, index) => ({
        _id: task._id,
        order: index,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input
          placeholder="Enter a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </form>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {pageLoading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          No tasks yet
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
              {tasks.map((task) => (
                <SortableTask key={task._id} task={task}>
                  {(dragHandleProps) => (
                    <div>
                      <div
                        className={`flex items-center justify-between border rounded-md p-3 transition-colors
                          ${
                            task.completed
                              ? "bg-emerald-100 border-emerald-300"
                              : "bg-background"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            {...dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground mt-1"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCompleted(task);
                            }}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="text-emerald-500" />
                            ) : (
                              <Circle />
                            )}
                          </Button>

                          <div>
                            {editingTaskId === task._id ? (
                              <Input
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <p
                                onClick={(e) => e.stopPropagation()}
                                className={`font-medium ${
                                  task.completed
                                    ? "line-through text-emerald-700"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {editingTaskId === task._id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit(task);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(task);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenInfoId(
                                    openInfoId === task._id
                                      ? null
                                      : task._id
                                  );
                                }}
                              >
                                <Info className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {openInfoId === task._id && (
                        <div className="rounded-b-md border border-t-0 bg-muted/30 p-2 text-xs text-muted-foreground">
                          <p>
                            Created by <b>{task.createdByName}</b>
                          </p>
                          <p>{new Date(task.createdAt).toLocaleString()}</p>
                          {task.updatedAt && (
                            <p className="mt-1">
                              Updated by{" "}
                              <b>{task.updatedByName || "Unknown"}</b> •{" "}
                              {new Date(task.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </SortableTask>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}