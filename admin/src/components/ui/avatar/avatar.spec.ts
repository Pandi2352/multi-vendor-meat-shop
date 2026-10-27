import { describe, expect, it } from 'vitest';
import { getInitials } from './avatar';

describe('getInitials', () => {
  it.each([
    ['Muthu Kumar Karuppan', 'MK'],
    ['Ravi (counter)', 'RC'],
    ['super admin', 'SA'],
    ['  Selvi  ', 'S'],
    ['முருகேசன் பி', 'முபி'],
    ['', ''],
  ])('%s → %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
