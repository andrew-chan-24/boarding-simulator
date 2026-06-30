import { useEffect, useRef } from 'react';

/**
 * Calls `callback` on every animation frame while `running` is true.
 * `callback` receives the elapsed time in ms since the last frame.
 *
 * @param {(delta: number) => void} callback
 * @param {boolean} running
 */
export function useAnimationLoop(callback, running) {
  const callbackRef = useRef(callback);
  const rafRef      = useRef(null);
  const lastTimeRef = useRef(null);

  // Keep callback ref up to date without restarting the loop
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const loop = (timestamp) => {
      const delta = lastTimeRef.current ? timestamp - lastTimeRef.current : 0;
      lastTimeRef.current = timestamp;
      callbackRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [running]);
}