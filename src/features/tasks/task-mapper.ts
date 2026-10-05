type TaskRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline: string | null;
  matrix_quadrant:
    | 'urgent_important'
    | 'important_not_urgent'
    | 'urgent_not_important'
    | 'not_urgent_not_important'
    | null;
  recurrence_rule: string | null;
  is_recurring: boolean;
  is_completed: boolean;
  completed_at: string | null;
  location: string | null;
  project_id: string | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
  sort_order: number;
};

export function toTaskDto(row: TaskRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    dateToComplete: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    dateDeadline: row.deadline,
    matrixQuadrant: row.matrix_quadrant,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule,
    isCompleted: row.is_completed,
    dateCompleted: row.completed_at,
    location: row.location,
    projectId: row.project_id,
    parentTaskId: row.parent_task_id,
    dateCreated: row.created_at,
    updatedAt: row.updated_at,
    sortOrder: row.sort_order,
  };
}
