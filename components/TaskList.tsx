import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";

interface TaskListProps {
  taskList: Task[];
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskCompleteToggle: (taskId: string, completed: boolean) => Promise<void>;
}

const TaskList = ({ taskList, onTaskDelete, onTaskCompleteToggle }: TaskListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHeaderCell className="w-[50px] py-2"></TableHeaderCell>
          <TableHeaderCell className="py-2">Title</TableHeaderCell>
          <TableHeaderCell className="w-[100px] py-2">Label</TableHeaderCell>
          <TableHeaderCell className="w-[120px] py-2">Due Date</TableHeaderCell>
          <TableHeaderCell className="w-[100px] text-right py-2">Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {taskList.map((currentTask) => (
          <TaskRow
            key={currentTask.task_id}
            task={currentTask}
            onDelete={onTaskDelete}
            onToggleComplete={onTaskCompleteToggle}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;