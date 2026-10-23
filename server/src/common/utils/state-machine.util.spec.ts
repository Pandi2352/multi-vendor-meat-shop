import { describe, expect, it } from 'vitest';
import { AppException, ErrorCode } from '#common/exceptions';
import { createStateMachine } from './state-machine.util.js';

type S = 'PLACED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
type A = 'VENDOR' | 'CUSTOMER';

const machine = createStateMachine<S, A>('Order', [
  { from: 'PLACED', to: 'ACCEPTED', actors: ['VENDOR'] },
  { from: 'PLACED', to: 'REJECTED', actors: ['VENDOR'] },
  { from: ['PLACED', 'ACCEPTED'], to: 'CANCELLED' },
]);

describe('createStateMachine', () => {
  it('allows configured transitions', () => {
    expect(machine.canTransition('PLACED', 'ACCEPTED', 'VENDOR')).toBe(true);
    expect(machine.canTransition('ACCEPTED', 'CANCELLED', 'CUSTOMER')).toBe(true);
  });

  it('enforces actors', () => {
    expect(machine.canTransition('PLACED', 'ACCEPTED', 'CUSTOMER')).toBe(false);
    expect(machine.canTransition('PLACED', 'ACCEPTED')).toBe(false);
  });

  it('lists next states per actor', () => {
    expect(machine.nextStates('PLACED', 'VENDOR')).toEqual(['ACCEPTED', 'REJECTED', 'CANCELLED']);
    expect(machine.nextStates('PLACED', 'CUSTOMER')).toEqual(['CANCELLED']);
  });

  it('throws INVALID_STATUS_TRANSITION', () => {
    try {
      machine.assertTransition('REJECTED', 'ACCEPTED', 'VENDOR');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppException);
      expect((error as AppException).code).toBe(ErrorCode.INVALID_STATUS_TRANSITION);
      expect((error as AppException).getStatus()).toBe(409);
    }
  });
});
