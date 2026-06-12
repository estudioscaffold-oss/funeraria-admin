import { useState, useEffect, useCallback } from "react";
import { dbCollections } from "../lib/db";

const IS_ONLINE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== "REEMPLAZA_CON_TU_URL"
);

function lsLoad<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}
function lsSave<T>(key: string, v: T) {
  localStorage.setItem(key, JSON.stringify(v));
}

/**
 * Drop-in replacement for useState+localStorage that also syncs
 * to Supabase when online, enabling multi-device consistency.
 */
export function useCollection<T>(
  key: string,
  defaultValue: T[],
): [T[], (next: T[] | ((prev: T[]) => T[])) => void, boolean] {
  const [data, setData] = useState<T[]>(() => lsLoad(key, defaultValue));
  const [synced, setSynced] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    if (!IS_ONLINE) {
      setSynced(true);
      return;
    }
    dbCollections
      .get<T[]>(key, defaultValue)
      .then((remote) => {
        setData(remote);
        lsSave(key, remote);
        setSynced(true);
      })
      .catch(() => setSynced(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (nextOrUpdater: T[] | ((prev: T[]) => T[])) => {
      setData((prev) => {
        const next =
          typeof nextOrUpdater === "function"
            ? nextOrUpdater(prev)
            : nextOrUpdater;
        lsSave(key, next);
        if (IS_ONLINE) {
          dbCollections.set(key, next).catch(console.error);
        }
        return next;
      });
    },
    [key],
  );

  return [data, save, synced];
}
