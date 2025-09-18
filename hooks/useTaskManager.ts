import { useState, useEffect } from "react";
import { Task } from "@/types/models";
import { createBrowserClient } from '@supabase/ssr'
import {
  TaskState,
  TasksState,
  TaskOperations,
  TasksOperations,
} from "@/types/taskManager";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const FUNCTION_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;
console.log("Calling function at:", FUNCTION_ENDPOINT);

interface UseTaskManagerReturn
  extends TaskState,
    TasksState,
    TaskOperations,
    TasksOperations {}

export function useTaskManager(taskId?: string): UseTaskManagerReturn {
  // State for single task management
  const [task, setTask] = useState<Task | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // State for task list management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch single task
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const { data: task, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_id", taskId)
          .single();

        if (error) throw error;
        setTask(task);
        setDate(task.due_date ? new Date(task.due_date) : undefined);
      } catch (error: any) {
        console.error(`Error fetching task ID ${taskId}:`, error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Fetch all tasks
  useEffect(() => {
    if (taskId) return; // Don't fetch all tasks if we're managing a single task
    fetchTasks();
  }, []);

  // Single task operations
  const updateTask = (updates: Partial<Task>) => {
    setTask((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveTask = async (taskToSave?: Task) => {
    try {
      const taskData = taskToSave || task;
      if (!taskData) throw new Error("No task data to save");

      const { error } = await supabase
        .from("tasks")
        .update({
          ...taskData,
          due_date: date?.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("task_id", taskData.task_id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving task:", error);
      setError(error.message);
      throw error;
    }
  };

  const uploadImage = async (file: File) => {
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 1MB");
      }

      if (!task) throw new Error("No task found");

      const fileExt = file.name.split(".").pop();
      const fileName = `${task.user_id}/${task.task_id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
          duplex: "half",
          headers: {
            "content-length": file.size.toString(),
          },
        });

      if (uploadError) throw uploadError;

      const updatedTask = { ...task, image_url: fileName };
      setTask(updatedTask);
      await saveTask(updatedTask);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message);
      throw error;
    }
  };

  const removeImage = async () => {
    try {
      if (!task?.image_url) throw new Error("No image to remove");

      const fileName = task.image_url;
      const { error: storageError } = await supabase.storage
        .from("task-attachments")
        .remove([fileName]);

      if (storageError) throw storageError;

      const updatedTask = { ...task, image_url: null };
      setTask(updatedTask);
      await saveTask(updatedTask);
    } catch (error: any) {
      console.error("Error removing image:", error);
      setError(error.message);
      throw error;
    }
  };

  // Task list operations
  const fetchTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title,
            description,
            user_id: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        await fetchTasks();
        return data[0];
      }

      throw new Error("Failed to create task");
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message);
      throw error;
    }
  };

  return {
    task,
    date,
    tasks,
    isLoading,
    error,
    updateTask,
    saveTask,
    uploadImage,
    removeImage,
    fetchTasks,
    createTask,
  };
}