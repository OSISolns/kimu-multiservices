/**
 * useSafeFetch - A lightweight hook that provides an AbortController-aware
 * fetch wrapper for use inside useEffect hooks.
 *
 * Prevents "TypeError: NetworkError when attempting to fetch resource" (Firefox)
 * / "TypeError: Failed to fetch" (Chrome) caused by Turbopack HMR aborting
 * in-flight requests when components unmount or re-render during hot reload.
 *
 * Usage:
 *   const { safeFetch, abort } = useSafeFetch();
 *   useEffect(() => {
 *     safeFetch('/api/data').then(...);
 *     return abort; // cleanup
 *   }, []);
 */

import { useCallback, useRef } from 'react';

interface SafeFetchOptions extends RequestInit {
  // No extra options needed; signal is injected automatically
}

export function useSafeFetch() {
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Abort the current in-flight request (if any).
   * Call this as the useEffect cleanup function.
   */
  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  /**
   * A fetch wrapper that automatically attaches an AbortController signal.
   * Silently swallows AbortError so HMR teardown doesn't log to console.
   */
  const safeFetch = useCallback(
    async (input: RequestInfo | URL, options: SafeFetchOptions = {}): Promise<Response> => {
      // Abort any previous in-flight request before starting a new one
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch(input, {
          ...options,
          signal: controller.signal,
        });
        return response;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was intentionally cancelled (HMR/unmount) — not a real error
          throw error;
        }
        throw error;
      }
    },
    []
  );

  return { safeFetch, abort };
}
