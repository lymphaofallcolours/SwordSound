import { useRef, useCallback } from 'react';

import type { Session } from '@domain/models/session';

const MAX_HISTORY = 50;

export function useUndo() {
  const undoStack = useRef<Session[]>([]);
  const redoStack = useRef<Session[]>([]);

  const pushState = useCallback((session: Session) => {
    undoStack.current.push(session);
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift();
    }
    // Clear redo stack on new action
    redoStack.current = [];
  }, []);

  const undo = useCallback((): Session | null => {
    const prev = undoStack.current.pop();
    return prev ?? null;
  }, []);

  const redo = useCallback((): Session | null => {
    const next = redoStack.current.pop();
    return next ?? null;
  }, []);

  const pushRedo = useCallback((session: Session) => {
    redoStack.current.push(session);
  }, []);

  const canUndo = useCallback(() => undoStack.current.length > 0, []);
  const canRedo = useCallback(() => redoStack.current.length > 0, []);

  return { pushState, undo, redo, pushRedo, canUndo, canRedo };
}
