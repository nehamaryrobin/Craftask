import { z } from 'zod';

const projectFields = {
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10_000).nullable().optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Expected a six-digit hex color')
    .nullable()
    .optional(),
};

export const createProjectSchema = z.object(projectFields).strict();

export const updateProjectSchema = z
  .object(projectFields)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, 'At least one field is required');

export const projectIdSchema = z.string().uuid();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

