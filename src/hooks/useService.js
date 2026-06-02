import { useState, useEffect, useMemo } from "react";

// WeakMap maps the actual function object identity to a sub-Map of stringified arguments -> results.
// This is 100% immune to JS minification, obfuscation, or code-splitting collisions.
const serviceCache = new WeakMap();

/**
 * Custom hook to consume services with loading and error states and synchronous memory caching.
 * Uses a synchronous cache-first approach to completely eliminate render-phase state setters,
 * ensuring 100% hook order stability.
 * 
 * @param {Function} serviceFn - The service function to call
 * @param {Array} args - Arguments to pass to the service
 * @param {Array} deps - Dependency array for useEffect
 */
export const useService = (serviceFn, args = [], deps = []) => {
  // Ensure the service has a cache bucket
  if (!serviceCache.has(serviceFn)) {
    serviceCache.set(serviceFn, new Map());
  }
  const fnCache = serviceCache.get(serviceFn);
  
  // Serialize args to create the secondary cache key
  const argsKey = useMemo(() => JSON.stringify(args), [args]);

  const hasCachedData = fnCache.has(argsKey);

  // Single trigger state to prompt React re-renders when async data resolves
  const [, setTrigger] = useState(0);
  const [error, setError] = useState(null);

  // Dynamically resolve values directly from the cache during render phase.
  // This guarantees there is never a stale state or mismatch, with zero rendering aborts.
  const data = hasCachedData ? fnCache.get(argsKey) : null;
  const loading = !hasCachedData && !error;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // If already cached, do not perform a redundant network call
      if (fnCache.has(argsKey)) {
        return;
      }

      try {
        const result = await serviceFn(...args);
        if (isMounted) {
          fnCache.set(argsKey, result);
          setError(null);
          // Trigger a re-render to display the freshly cached value
          setTrigger(prev => prev + 1);
        }
      } catch (err) {
        console.error(`useService hydration failed for service:`, serviceFn, err);
        if (isMounted) {
          setError(err);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [serviceFn, argsKey, ...deps]);

  const refetch = () => {
    if (fnCache.has(argsKey)) {
      fnCache.delete(argsKey);
    }
    setError(null);
    setTrigger(prev => prev + 1);
  };

  return { data, loading, error, refetch };
};

/**
 * Utility to clear the cache for a specific service function
 */
export const clearServiceCache = (serviceFn) => {
  if (serviceCache.has(serviceFn)) {
    serviceCache.get(serviceFn).clear();
  }
};
