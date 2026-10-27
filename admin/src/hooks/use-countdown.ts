import { useEffect, useState } from 'react';

/** Seconds left on a resend timer, ticking down to 0. `start(n)` restarts it. */
export const useCountdown = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return { seconds, start: setSeconds };
};
