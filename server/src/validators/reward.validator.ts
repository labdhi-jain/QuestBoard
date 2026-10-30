import { z } from 'zod';

export const createRewardSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  pointCost: z.number().int().positive('Point cost must be greater than zero'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  active: z.boolean().default(true),
});

export const updateRewardSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  pointCost: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export type CreateRewardInput = z.infer<typeof createRewardSchema>;
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
