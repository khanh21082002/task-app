// Create/Insert new task
const { data, error } = await supabase
  .from("tasks") // Specify the 'tasks' table to insert into
  .insert({ title, description }) // Insert a new record with title and description
  .select(); // Select the inserted record to return it

// Fetch a task, given a taskId
const { data: task, error } = await supabase
  .from("tasks") // Access the 'tasks' table
  .select("*") // Select all columns
  .eq("task_id", taskId) // Filter by specific task_id
  .single(); // Expect a single record in response