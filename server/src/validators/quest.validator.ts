import { z } from 'zod';

export const questCategories = ['EXPLORE', 'ACADEMICS', 'SOCIAL', 'WELLNESS'] as const;
export const verificationTypes = ['QR', 'MANUAL'] as const;
export const questStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const createQuestSchema = z.object({
  title: z.string().trim().min(1, 'Quest title is required'),
  description: z.string().trim().min(1, 'Quest description is required'),
  locationHint: z.string().trim().min(1, 'Location hint is required'),
  pointValue: z.number().int().positive('Point value must be greater than zero'),
  category: z.enum(questCategories, { errorMap: () => ({ message: 'Invalid category' }) }),
  verificationType: z.enum(verificationTypes).default('QR'),
  status: z.enum(questStatuses).default('DRAFT'),
  prerequisiteQuestId: z.string().uuid().nullable().optional(),
}).refine((data) => {
  if (data.status === 'PUBLISHED') {
    return data.title.length > 0 && data.pointValue > 0;
  }
  return true;
}, {
  message: 'Published quests must have a title and a point value greater than zero',
  path: ['status'],
});

export const updateQuestSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  locationHint: z.string().trim().min(1).optional(),
  pointValue: z.number().int().positive('Point value must be greater than zero').optional(),
  category: z.enum(questCategories).optional(),
  verificationType: z.enum(verificationTypes).optional(),
  status: z.enum(questStatuses).optional(),
  prerequisiteQuestId: z.string().uuid().nullable().optional(),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;
