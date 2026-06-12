import { useEffect, useRef, useState } from 'react';

interface UseRestTimerReturn {
  /** Seconds remaining in the current rest period (0 when not resting). */
  secondsLeft: number;
  /** True while a rest countdown is active. */
  isResting: boolean;
  /** Begin a rest countdown of the given duration. */
  start: (seconds: number) => void;
  /** End the current rest immediately. */
  skip: () => void;
}

const TICK_INTERVAL_MS = 1000;

export function useRestTimer(): UseRestTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = (): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => clear, []);

  const start = (seconds: number): void => {
    clear();
    if (seconds <= 0) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, TICK_INTERVAL_MS);
  };

  const skip = (): void => {
    clear();
    setSecondsLeft(0);
  };

  return { secondsLeft, isResting: secondsLeft > 0, start, skip };
}
