import dayjs, { type Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { IST_TIMEZONE } from '#common/constants';

dayjs.extend(utc);
dayjs.extend(timezone);

export type DateInput = Date | string | number | Dayjs;

export interface TimeRange {
  /** HH:mm */
  open: string;
  /** HH:mm — may be earlier than `open` for shops that close after midnight. */
  close: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

const MINUTES_PER_DAY = 24 * 60;

export const toIST = (date: DateInput = new Date()): Dayjs => dayjs(date).tz(IST_TIMEZONE);

export const nowIST = (): Dayjs => toIST();

export const startOfDayIST = (date: DateInput = new Date()): Date =>
  toIST(date).startOf('day').toDate();

export const endOfDayIST = (date: DateInput = new Date()): Date =>
  toIST(date).endOf('day').toDate();

export const formatIST = (date: DateInput, format = 'DD MMM YYYY, hh:mm A'): string =>
  toIST(date).format(format);

export const addMinutes = (date: DateInput, minutes: number): Date =>
  dayjs(date).add(minutes, 'minute').toDate();

export const isExpired = (expiresAt: DateInput, now: DateInput = new Date()): boolean =>
  !dayjs(expiresAt).isAfter(dayjs(now));

/** `'09:30'` → 570 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** 570 → `'09:30'` */
export const minutesToTime = (totalMinutes: number): string => {
  const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/** Checks a moment against business hours in IST. Supports ranges that cross midnight. */
export const isWithinHours = (range: TimeRange, at: DateInput = new Date()): boolean => {
  const current = toIST(at);
  const minutes = current.hour() * 60 + current.minute();
  const open = timeToMinutes(range.open);
  const close = timeToMinutes(range.close);
  return open <= close ? minutes >= open && minutes < close : minutes >= open || minutes < close;
};

/** Splits business hours into fixed-length delivery/preparation slots. */
export const generateSlots = (range: TimeRange, slotMinutes: number): TimeSlot[] => {
  const open = timeToMinutes(range.open);
  let close = timeToMinutes(range.close);
  if (close <= open) close += MINUTES_PER_DAY;

  const slots: TimeSlot[] = [];
  for (let start = open; start + slotMinutes <= close; start += slotMinutes) {
    slots.push({ start: minutesToTime(start), end: minutesToTime(start + slotMinutes) });
  }
  return slots;
};
