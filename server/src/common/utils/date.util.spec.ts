import { describe, expect, it } from 'vitest';
import {
  addMinutes,
  formatIST,
  generateSlots,
  isExpired,
  isWithinHours,
  minutesToTime,
  startOfDayIST,
  timeToMinutes,
} from './date.util.js';

// 2026-10-23 10:00 IST = 04:30 UTC
const TEN_AM_IST = new Date('2026-10-23T04:30:00Z');

describe('date.util', () => {
  it('formats in IST', () => {
    expect(formatIST(TEN_AM_IST, 'YYYY-MM-DD HH:mm')).toBe('2026-10-23 10:00');
  });

  it('gets the start of the IST day', () => {
    expect(startOfDayIST(TEN_AM_IST).toISOString()).toBe('2026-10-22T18:30:00.000Z');
  });

  it('converts HH:mm and minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570);
    expect(minutesToTime(570)).toBe('09:30');
    expect(minutesToTime(24 * 60 + 15)).toBe('00:15');
  });

  it('checks business hours, including ranges past midnight', () => {
    expect(isWithinHours({ open: '06:00', close: '21:00' }, TEN_AM_IST)).toBe(true);
    expect(isWithinHours({ open: '11:00', close: '21:00' }, TEN_AM_IST)).toBe(false);
    expect(isWithinHours({ open: '22:00', close: '11:00' }, TEN_AM_IST)).toBe(true);
  });

  it('generates slots', () => {
    expect(generateSlots({ open: '06:00', close: '07:30' }, 30)).toEqual([
      { start: '06:00', end: '06:30' },
      { start: '06:30', end: '07:00' },
      { start: '07:00', end: '07:30' },
    ]);
    expect(generateSlots({ open: '23:00', close: '00:00' }, 30)).toHaveLength(2);
  });

  it('checks expiry', () => {
    const later = addMinutes(TEN_AM_IST, 15);
    expect(isExpired(later, TEN_AM_IST)).toBe(false);
    expect(isExpired(TEN_AM_IST, later)).toBe(true);
    expect(isExpired(TEN_AM_IST, TEN_AM_IST)).toBe(true);
  });
});
