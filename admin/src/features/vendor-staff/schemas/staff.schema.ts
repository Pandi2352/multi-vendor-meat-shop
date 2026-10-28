import { z } from 'zod';
import { zEmail, zOptionalIndianPhone, zRequiredString } from '@/utils/validation';

const details = {
  name: zRequiredString('Name', 1, 80),
  phone: zOptionalIndianPhone(),
  dutyTitle: z.string().trim().max(60, 'Keep the job title under 60 characters').optional(),
};

export const inviteStaffSchema = z.object({ ...details, email: zEmail() });
export type InviteStaffValues = z.output<typeof inviteStaffSchema>;
export type InviteStaffInput = z.input<typeof inviteStaffSchema>;

export const editStaffSchema = z.object(details);
export type EditStaffValues = z.output<typeof editStaffSchema>;
export type EditStaffInput = z.input<typeof editStaffSchema>;
