import { useEffect, useRef, useState } from 'react';

interface UseWorkoutTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
}

const TICK_INTERVAL_MS = 1000;

export function useWorkoutTimer(): UseWorkoutTimerReturn {
  // Accumulated elapsed time from previous running segments.
  const accumulatedRef = useRef<number>(0);
  // Timestamp marking the start of the current running segment (null when paused).
  const segmentStartRef = useRef<number | null>(Date.now());
  const [isRunning, setIsRunning] = useState<boolean>(true);
  // Used only to force a re-render on each tick; value itself is irrelevant.
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      setTick((prev) => prev + 1);
    }, TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const pause = (): void => {
    if (segmentStartRef.current !== null) {
      accumulatedRef.current += Date.now() - segmentStartRef.current;
      segmentStartRef.current = null;
    }
    setIsRunning(false);
  };

  const resume = (): void => {
    if (segmentStartRef.current === null) {
      segmentStartRef.current = Date.now();
    }
    setIsRunning(true);
  };

  const currentSegment =
    segmentStartRef.current !== null ? Date.now() - segmentStartRef.current : 0;
  const elapsedSeconds = Math.floor((accumulatedRef.current + currentSegment) / 1000);

  return { elapsedSeconds, isRunning, pause, resume };
}
