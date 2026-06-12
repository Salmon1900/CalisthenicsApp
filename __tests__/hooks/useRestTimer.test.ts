import { act, renderHook } from '@testing-library/react-native';
import { useRestTimer } from '../../hooks/useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts a countdown and reports resting', () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(3));
    expect(result.current.secondsLeft).toBe(3);
    expect(result.current.isResting).toBe(true);
  });

  it('counts down and auto-stops at zero', () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(2));
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(1);

    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isResting).toBe(false);
  });

  it('skip ends the rest immediately', () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(10));
    act(() => result.current.skip());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isResting).toBe(false);
  });

  it('does not start for a non-positive duration', () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(0));
    expect(result.current.isResting).toBe(false);
  });
});
