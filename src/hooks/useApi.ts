"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Mutate the cached data locally (e.g. after a successful create/update/delete). */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Minimal data-fetching hook: runs `fn` on mount (and when `deps` change),
 * tracks loading/error state, and exposes refetch + local mutation.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Always call the latest fn without making it an effect dependency.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  // Caller-provided deps are serialized so the effect's dependency list stays static.
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;
    // Defer to a microtask so no state is set synchronously inside the effect body.
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [depsKey, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch, setData };
}
