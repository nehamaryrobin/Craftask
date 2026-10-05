import { z } from 'zod';

export const matrixQuadrantSchema = z.enum([
  'urgent_important',
  'important_not_urgent',
  'urgent_not_important',
  'not_urgent_not_important',
]);

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const nullableUuid = z.string().uuid().nullable().optional();

const taskFields = {
  name: z.string().trim().min(1).max(255),
  description: nullableText(10_000),
  dateToComplete: z.string().date().nullable().optional(),
  scheduledTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, 'Expected HH:mm or HH:mm:ss')
    .nullable()
    .optional(),
  dateDeadline: z.string().date().nullable().optional(),
  matrixQuadrant: matrixQuadrantSchema.nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: nullableText(1_000),
  isCompleted: z.boolean().optional(),
  location: nullableText(500),
  projectId: nullableUuid,
  parentTaskId: nullableUuid,
  sortOrder: z.number().finite().optional(),
};

function validateRecurrence(
  input: { isRecurring?: boolean; recurrenceRule?: string | null },
  context: z.RefinementCtx,
) {
  if (input.isRecurring === true && !input.recurrenceRule) {
    context.addIssue({
      code: 'custom',
      path: ['recurrenceRule'],
      message: 'A recurrence rule is required when isRecurring is true',
    });
  }

  if (input.isRecurring === false && input.recurrenceRule) {
    context.addIssue({
      code: 'custom',
      path: ['recurrenceRule'],
      message: 'A recurrence rule cannot be set when isRecurring is false',
    });
  }
}

export const createTaskSchema = z
  .object(taskFields)
  .strict()
  .superRefine(validateRecurrence);

export const updateTaskSchema = z
  .object(taskFields)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, 'At least one field is required')
  .superRefine(validateRecurrence);

export const taskIdSchema = z.string().uuid();

export const taskQuerySchema = z
  .object({
    projectId: z.union([z.string().uuid(), z.literal('none')]).optional(),
    dateToComplete: z.string().date().optional(),
    isCompleted: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    matrixQuadrant: matrixQuadrantSchema.optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
