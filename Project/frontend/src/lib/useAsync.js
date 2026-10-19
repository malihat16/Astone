import { useCallback, useEffect, useState } from 'react';

/**
 * Run an async loader and track loading / error / data.
 * Wrap the loader in useCallback so it only re-runs when its inputs change.
 */
export function useAsync(loader) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    loader()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: undefined, error, loading: false }));
    return () => {
      active = false;
    };
  }, [loader, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, reload, setData };
}
