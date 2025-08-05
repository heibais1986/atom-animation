"use client";

import { useCallback, useRef, useEffect } from "react";

/**
 * A reusable hook to handle continuous action on a long press.
 * It abstracts the complex logic of timers and event handlers
 * (`onMouseDown`, `onMouseUp`, etc.), providing a clean way to
 * implement 'press-and-hold' functionality and avoid code duplication.
 *
 * @param callback The function to be called repeatedly.
 * @param speed The interval (in ms) at which the callback fires during the hold.
 * @param delay The delay (in ms) after the initial press before continuous firing begins.
 */
export const useLongPress = (
  callback: () => void,
  speed: number = 100,
  delay: number = 400
) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchHandled = useRef(false);

  // Keep the callback ref up to date to avoid the "stale closure" problem.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // Prevent default browser actions (e.g., text selection).
      event.preventDefault();
      // Fire once immediately for instant feedback.
      callbackRef.current();

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          callbackRef.current();
        }, speed);
      }, delay);
    },
    [delay, speed]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchHandled.current = true;
      start(e);
    },
    [start]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (touchHandled.current) {
        return;
      }
      if (e.button !== 0) {
        return;
      }
      start(e);
    },
    [start]
  );

  const handleMouseUp = useCallback(() => {
    if (touchHandled.current) {
      touchHandled.current = false;
    }
    stop();
  }, [stop]);

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchEnd: stop,
  };
};
