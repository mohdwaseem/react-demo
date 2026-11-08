"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook: returns a function that runs `callback` only after the caller stopped
 * calling it for `delayMs`. Used by the search box, so the API is called once the user
 * pauses typing instead of on every key press.
 *
 * A custom hook is just a function whose name starts with "use" and that calls other hooks.
 * useRef = a mutable box that survives re-renders WITHOUT causing a re-render (like a private field).
 */
export function useDebouncedCallback<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs = 400) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latestCallback = useRef(callback);

  // Always call the newest callback (it may capture new state).
  useEffect(() => {
    latestCallback.current = callback;
  });

  // Cleanup: cancel a pending call when the component unmounts.
  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback(
    (...args: TArgs) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latestCallback.current(...args), delayMs);
    },
    [delayMs],
  );
}
