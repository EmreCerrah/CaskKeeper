import { useEffect, useState } from "react";

/**
 * Değeri belirtilen süre boyunca sakinleşene kadar geciktirir.
 *
 * Arama kutusu için: her harfte istek atmak hem sunucuyu hem pili yorar.
 * "Lagavulin" yazan biri 9 istek yerine 1 istek üretir.
 */
export function useDebounced<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
