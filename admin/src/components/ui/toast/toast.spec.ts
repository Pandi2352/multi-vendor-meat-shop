import { describe, it, expect, beforeEach } from 'vitest';
import { toast, toastStore } from './toast.store';

describe('Admin Toast Store', () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it('starts with empty toasts', () => {
    expect(toastStore.getToasts()).toEqual([]);
  });

  it('adds a success toast with proper properties', () => {
    const id = toast.success('Staff invited', { title: 'Success' });
    const toasts = toastStore.getToasts();

    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].message).toBe('Staff invited');
    expect(toasts[0].tone).toBe('success');
  });

  it('dismisses a toast by id', () => {
    const id1 = toast('Pickup completed');
    const id2 = toast('Delivery finished');

    expect(toastStore.getToasts()).toHaveLength(2);
    toast.dismiss(id1);

    const remaining = toastStore.getToasts();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(id2);
  });
});
