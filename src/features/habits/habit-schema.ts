import { z } from 'zod';

export const habitFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'selected_days',
]);

const daysOfWeekSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1)
  .max(7)
  .refine((days) => new Set(days).size === days.length, 'Days of the week must be unique')
  .transform((days) => [...days].sort((a, b) => a - b));

const habitFields = {
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10_000).nullable().optional(),
  frequency: habitFrequencySchema,
  daysOfWeek: daysOfWeekSchema.nullable().optional(),
  startDate: z.string().date().optional(),
  isActive: z.boolean().optional(),
};

function validateSchedule(
  input: { frequency?: z.infer<typeof habitFrequencySchema>; daysOfWeek?: number[] | null },
  context: z.RefinementCtx,
) {
  if (input.frequency === 'selected_days' && !input.daysOfWeek?.length) {
    context.addIssue({
      code: 'custom',
      path: ['daysOfWeek'],
      message: 'Select at least one day for a selected-days habit',
    });
  }

  if (input.frequency && input.frequency !== 'selected_days' && input.daysOfWeek?.length) {
    context.addIssue({
      code: 'custom',
      path: ['daysOfWeek'],
      message: 'daysOfWeek is only valid for selected-days habits',
    });
  }
}

export const createHabitSchema = z
  .object(habitFields)
  .strict()
  .superRefine(validateSchedule);

export const updateHabitSchema = z
  .object(habitFields)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, 'At least one field is required')
  .superRefine(validateSchedule);

export const habitIdSchema = z.string().uuid();

export const habitReferenceDateSchema = z
  .object({ onDate: z.string().date().optional() })
  .strict();

export const checkInSchema = z.object({ completedOn: z.string().date() }).strict();

export const checkInQuerySchema = z
  .object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .strict()
  .refine((input) => !input.from || !input.to || input.from <= input.to, {
    path: ['to'],
    message: 'to must be on or after from',
  });

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CheckInQuery = z.infer<typeof checkInQuerySchema>;
