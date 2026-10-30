import { z } from 'zod';

export const scanCheckInSchema = z.object({
  token: z.string().trim().min(1, 'QR scan token is required'),
});

export const manualCheckInSchema = z.object({
  questId: z.string().uuid('Invalid quest ID'),
  note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional(),
});

export const reviewCheckInSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be either VERIFIED or REJECTED' }),
  }),
});

export type ScanCheckInInput = z.infer<typeof scanCheckInSchema>;
export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;
export type ReviewCheckInInput = z.infer<typeof reviewCheckInSchema>;
