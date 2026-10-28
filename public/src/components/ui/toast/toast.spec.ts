import { describe, it, expect, beforeEach } from 'vitest';
import { toast, toastStore } from './toast.store';

describe('Toast Store', () => {
  beforeEach(() => {
    toastStore.clear();
  });

  it('starts with empty toasts', () => {
    expect(toastStore.getToasts()).toEqual([]);
  });

  it('adds a success toast with proper properties', () => {
    const id = toast.success('Order placed', { title: 'Success' });
    const toasts = toastStore.getToasts();

    expect(toasts).toHaveLength(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].message).toBe('Order placed');
    expect(toasts[0].tone).toBe('success');
    expect(toasts[0].title).toBe('Success');
  });

  it('adds error, warning, and info toasts', () => {
    toast.error('Payment failed');
    toast.warning('Shop closing soon');
    toast.info('OTP generated');

    const toasts = toastStore.getToasts();
    expect(toasts).toHaveLength(3);
    expect(toasts[0].tone).toBe('error');
    expect(toasts[1].tone).toBe('warning');
    expect(toasts[2].tone).toBe('info');
  });

  it('dismisses a toast by id', () => {
    const id1 = toast('First');
    const id2 = toast('Second');

    expect(toastStore.getToasts()).toHaveLength(2);
    toast.dismiss(id1);

    const remaining = toastStore.getToasts();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(id2);
  });

  it('clears all toasts', () => {
    toast('One');
    toast('Two');
    expect(toastStore.getToasts()).toHaveLength(2);

    toast.clear();
    expect(toastStore.getToasts()).toHaveLength(0);
  });
});
