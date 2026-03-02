import { useEffect, useCallback } from "react";
import type { Role, TrackData } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";

export function useUndoRedoHistory(
  setCards: (cards: Role[] | ((prev: Role[]) => Role[])) => void,
  setTracks: (
    tracks: TrackData[] | ((prev: TrackData[]) => TrackData[]),
  ) => void,
) {
  const currentIndex = useHistoryStore((state) => state.currentIndex);
  const historyLength = useHistoryStore((state) => state.history.length);
  const storeUndo = useHistoryStore((state) => state.undo);
  const storeRedo = useHistoryStore((state) => state.redo);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex >= 0 && currentIndex < historyLength - 1;

  const undo = useCallback(() => {
    storeUndo(setCards as (cards: Role[]) => void, setTracks as (tracks: TrackData[]) => void);
  }, [storeUndo, setCards, setTracks]);

  const redo = useCallback(() => {
    storeRedo(setCards as (cards: Role[]) => void, setTracks as (tracks: TrackData[]) => void);
  }, [storeRedo, setCards, setTracks]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Check for Cmd/Ctrl
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdCtrl) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
             if (canRedo) redo(); // Ctrl+Shift+Z / Cmd+Shift+Z
          } else {
             if (canUndo) undo(); // Ctrl+Z / Cmd+Z
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          if (canRedo) redo(); // Ctrl+Y / Cmd+Y
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
