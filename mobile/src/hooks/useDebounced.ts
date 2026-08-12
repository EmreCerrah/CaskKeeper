import { useEffect, useState } from "react";

/**
 * Holds a value back until it has been quiet for the given delay.
 *
 * For the search box: firing a request per keystroke taxes both the server and
 * the battery. Someone typing "Lagavulin" produces one request instead of
 * nine.
 */
export function useDebounced<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
