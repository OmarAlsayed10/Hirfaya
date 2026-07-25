import { useRef } from "react";

export function usePendingEdit<T>() {
  const pendingRef = useRef<T | null>(null);

  const start = (oldValue: T) => {
    if (pendingRef.current === null) pendingRef.current = oldValue;
  };

  const take = (): T | null => {
    const value = pendingRef.current;
    pendingRef.current = null;
    return value;
  };

  return { start, take };
}
