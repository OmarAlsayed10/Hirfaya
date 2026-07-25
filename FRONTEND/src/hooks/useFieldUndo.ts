import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store/store";
import { pushFieldHistory, popFieldHistory } from "../redux/store/slices/fieldHistorySlice";
import { usePendingEdit } from "./usePendingEdit";

export function useFieldUndo<T>(key: string, applyValue: (value: T) => void) {
  const dispatch = useDispatch();
  const pending = usePendingEdit<T>();
  const stack = useSelector((s: RootState) => s.fieldHistory.entries[key]) as T[] | undefined;
  const canUndo = !!stack && stack.length > 0;

  const onTypingChange = useCallback(
    (oldValue: T) => pending.start(oldValue),
    [pending],
  );

  const commitTyping = useCallback(() => {
    const oldValue = pending.take();
    if (oldValue !== null) dispatch(pushFieldHistory({ key, value: oldValue }));
  }, [dispatch, key, pending]);

  const pushChange = useCallback(
    (oldValue: T) => dispatch(pushFieldHistory({ key, value: oldValue })),
    [dispatch, key],
  );

  const undo = useCallback(() => {
    if (!stack || stack.length === 0) return;
    const previous = stack[stack.length - 1];
    applyValue(previous);
    dispatch(popFieldHistory({ key }));
  }, [applyValue, dispatch, key, stack]);

  return { canUndo, onTypingChange, commitTyping, pushChange, undo };
}
