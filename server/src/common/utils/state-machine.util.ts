import { AppException, ErrorCode } from '#common/exceptions';

export interface Transition<S extends string, A extends string> {
  from: S | readonly S[];
  to: S;
  /** Roles allowed to perform the transition. Omit to allow any actor. */
  actors?: readonly A[];
}

export interface StateMachine<S extends string, A extends string> {
  canTransition(from: S, to: S, actor?: A): boolean;
  assertTransition(from: S, to: S, actor?: A): void;
  nextStates(from: S, actor?: A): S[];
}

/**
 * Single source of truth for allowed status changes (orders, payments, refunds, deliveries, vendor verification).
 * Services call `assertTransition` instead of assigning statuses directly.
 */
export const createStateMachine = <S extends string, A extends string = string>(
  name: string,
  transitions: readonly Transition<S, A>[],
): StateMachine<S, A> => {
  const matches = (t: Transition<S, A>, from: S, actor?: A): boolean => {
    const sources: readonly S[] = Array.isArray(t.from) ? t.from : [t.from as S];
    const actorAllowed = !t.actors || (actor !== undefined && t.actors.includes(actor));
    return sources.includes(from) && actorAllowed;
  };

  const canTransition = (from: S, to: S, actor?: A): boolean =>
    transitions.some((t) => t.to === to && matches(t, from, actor));

  return {
    canTransition,
    assertTransition(from, to, actor) {
      if (!canTransition(from, to, actor)) {
        throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION, {
          message: `${name} cannot move from ${from} to ${to}`,
          details: { machine: name, from, to, actor },
        });
      }
    },
    nextStates(from, actor) {
      return [...new Set(transitions.filter((t) => matches(t, from, actor)).map((t) => t.to))];
    },
  };
};
