import { useState, useRef, useEffect, useCallback } from "react";
import type { Role, TrackData, Transform, Point } from "../types";
import { GRID_SIZE } from "../constants";

import { useZoomPan } from "./interactions/useZoomPan";
import { useSelection } from "./interactions/useSelection";
import { useTrackResize } from "./interactions/useTrackResize";
import { useCanvasDrag } from "./interactions/useCanvasDrag";

export function useCanvasInteraction(
  transform: Transform,
  setTransform: (t: Transform | ((prev: Transform) => Transform)) => void,
  cards: Role[],
  setCards: (cards: Role[] | ((prev: Role[]) => Role[])) => void,
  tracks: TrackData[],
  setTracks: (
    tracks: TrackData[] | ((prev: TrackData[]) => TrackData[]),
  ) => void,
  toolMode: "select" | "pan" | "track" | "record" | "present",
  canvasRef: React.RefObject<HTMLDivElement | null>,
  deleteZoneRef: React.RefObject<HTMLDivElement | null>,
) {
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const isOverDeleteZoneRef = useRef(isOverDeleteZone);

  // Stable Refs for inputs
  const transformRef = useRef(transform);
  const cardsRef = useRef(cards);
  const tracksRef = useRef(tracks);
  const toolModeRef = useRef(toolMode);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);
  useEffect(() => {
    toolModeRef.current = toolMode;
  }, [toolMode]);
  useEffect(() => {
    isOverDeleteZoneRef.current = isOverDeleteZone;
  }, [isOverDeleteZone]);

  // Shared pointer and gesture refs
  const primaryPointerIdRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const lastPinchDistanceRef = useRef<number | null>(null);
  const lastPinchMidpointRef = useRef<Point | null>(null);
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const backgroundTouchStartRef = useRef<Point | null>(null);

  // 1. Zoom and Pan
  const {
    isPanning,
    lastPanPointRef,
    handleZoom,
    handleWheel,
    startPan,
    updatePan,
    stopPan,
  } = useZoomPan(setTransform, canvasRef);

  // 2. Selection
  const {
    isSelectionMode,
    setIsSelectionMode,
    isSelectionModeRef,
    selectedIds,
    setSelectedIds,
    selectedIdsRef,
    clearSelection,
  } = useSelection();

  // 3. Track Resize
  const {
    resizingId,
    resizingSide,
    handleResizeStart,
    updateResize,
    stopResize,
  } = useTrackResize(setTracks, transformRef, primaryPointerIdRef);

  // 4. Canvas Drag (Cards & Tracks)
  const {
    draggingId,
    draggingType,
    draggedNewCard,
    handleStartDragCard,
    handleStartDragTrack,
    startDragNewCard,
    updateDrag,
    stopDrag,
  } = useCanvasDrag(
    cardsRef,
    tracksRef,
    setCards,
    setTracks,
    transformRef,
    toolModeRef,
    selectedIdsRef,
    setSelectedIds,
    isSelectionModeRef,
    setIsSelectionMode,
    primaryPointerIdRef,
    longPressTimerRef,
    dragStartPointRef,
  );

  // Pointer Move Orchestration
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Update active pointers
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      // Pinch zoom + pan
      if (activePointersRef.current.size >= 2) {
        const points = Array.from(activePointersRef.current.values());
        const [p1, p2] = points;
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        if (
          lastPinchDistanceRef.current !== null &&
          lastPinchMidpointRef.current !== null
        ) {
          const zoomDelta = (distance - lastPinchDistanceRef.current) * 0.003;
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            handleZoom(zoomDelta, midX - rect.left, midY - rect.top);
          }
          const panDx = midX - lastPinchMidpointRef.current.x;
          const panDy = midY - lastPinchMidpointRef.current.y;
          if (panDx !== 0 || panDy !== 0) {
            setTransform((prev) => ({
              ...prev,
              x: prev.x + panDx,
              y: prev.y + panDy,
            }));
          }
        }
        lastPinchDistanceRef.current = distance;
        lastPinchMidpointRef.current = { x: midX, y: midY };
        return;
      }

      // Single touch constraint
      if (
        primaryPointerIdRef.current !== null &&
        e.pointerId !== primaryPointerIdRef.current
      )
        return;

      if (longPressTimerRef.current && dragStartPointRef.current) {
        const dist = Math.hypot(
          e.clientX - dragStartPointRef.current.x,
          e.clientY - dragStartPointRef.current.y,
        );
        if (dist > 5) {
          window.clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }

      // Background touch lazy start
      const bgTouchStart = backgroundTouchStartRef.current;
      if (bgTouchStart) {
        const dist = Math.hypot(
          e.clientX - bgTouchStart.x,
          e.clientY - bgTouchStart.y,
        );
        if (dist > 5) {
          startPan(e.clientX, e.clientY);
          backgroundTouchStartRef.current = null;
        } else {
          return;
        }
      }

      // Route to sub-hooks sequentially based on what's active
      updatePan(e.clientX, e.clientY);

      const isResizing = updateResize(e.clientX, e.clientY);
      if (isResizing) return;

      if (deleteZoneRef.current) {
        const dzRect = deleteZoneRef.current.getBoundingClientRect();
        const isOver =
          e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom;
        setIsOverDeleteZone(isOver);
      }

      updateDrag(e.clientX, e.clientY);
    },
    [
      handleZoom,
      setTransform,
      startPan,
      updatePan,
      updateResize,
      updateDrag,
      canvasRef,
      deleteZoneRef,
    ],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size < 2) {
        lastPinchDistanceRef.current = null;
        lastPinchMidpointRef.current = null;
      }

      if (e.pointerId !== primaryPointerIdRef.current) return;
      primaryPointerIdRef.current = null;

      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (backgroundTouchStartRef.current) {
        clearSelection();
        backgroundTouchStartRef.current = null;
      }

      stopDrag(e.clientX, e.clientY, isOverDeleteZoneRef.current);
      stopResize();
      stopPan();
      setIsOverDeleteZone(false);
      dragStartPointRef.current = null;
    },
    [clearSelection, stopDrag, stopResize, stopPan],
  );

  useEffect(() => {
    const trackPointerStart = (e: PointerEvent) => {
      if (canvasRef.current && canvasRef.current.contains(e.target as Node)) {
        activePointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }
    };
    window.addEventListener("pointerdown", trackPointerStart, true);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerdown", trackPointerStart, true);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, canvasRef]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button === 1) {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;
      startPan(e.clientX, e.clientY);
      return;
    }
    if (toolMode === "pan") {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;
      startPan(e.clientX, e.clientY);
      return;
    }
    if (toolMode === "select") {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;

      if (isSelectionModeRef.current) {
        clearSelection();
        primaryPointerIdRef.current = null;
        return;
      }

      if (e.pointerType !== "mouse") {
        backgroundTouchStartRef.current = { x: e.clientX, y: e.clientY };
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      } else {
        clearSelection();
      }
    }
  };

  const clipboardRef = useRef<
    { type: "card" | "track"; data: Role | TrackData }[]
  >([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (isSelectionModeRef.current) clearSelection();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = selectedIdsRef.current;
        if (selected.length > 0) {
          setCards((prev) => prev.filter((c) => !selected.includes(c.id)));
          setTracks((prev) => prev.filter((t) => !selected.includes(t.id)));
          clearSelection();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyC") {
        const selected = selectedIdsRef.current;
        if (selected.length > 0) {
          const itemsToCopy: {
            type: "card" | "track";
            data: Role | TrackData;
          }[] = [];

          const currentCards = cardsRef.current;
          currentCards.forEach((c) => {
            if (selected.includes(c.id)) {
              itemsToCopy.push({ type: "card", data: c });
            }
          });

          const currentTracks = tracksRef.current;
          currentTracks.forEach((t) => {
            if (selected.includes(t.id)) {
              itemsToCopy.push({ type: "track", data: t });
            }
          });

          clipboardRef.current = JSON.parse(JSON.stringify(itemsToCopy));
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        const clipboard = clipboardRef.current;
        if (clipboard.length > 0) {
          const newCards: Role[] = [];
          const newTracks: TrackData[] = [];
          const newSelectedIds: string[] = [];

          clipboard.forEach((item) => {
            const newId = `${item.type === "track" ? "track-" : ""}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const newItem = {
              ...item.data,
              id: newId,
              x: item.data.x + GRID_SIZE,
              y: item.data.y + GRID_SIZE,
            };

            if (item.type === "card") {
              newCards.push(newItem as Role);
            } else {
              newTracks.push(newItem as TrackData);
            }
            newSelectedIds.push(newId);
          });

          if (newCards.length > 0) setCards((prev) => [...prev, ...newCards]);
          if (newTracks.length > 0)
            setTracks((prev) => [...prev, ...newTracks]);

          const newClipboard = [
            ...newCards.map((c) => ({ type: "card" as const, data: c })),
            ...newTracks.map((t) => ({ type: "track" as const, data: t })),
          ];
          clipboardRef.current = newClipboard;

          setSelectedIds(newSelectedIds);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCards, setTracks, clearSelection, setSelectedIds]);

  return {
    draggingId,
    draggingType,
    resizingId,
    resizingSide,
    isPanning,
    isOverDeleteZone,
    selectedIds,
    handleStartDragCard,
    handleStartDragTrack,
    handleResizeStart,
    handlePointerDown,
    handleWheel,
    handleZoom,
    startDragNewCard,
    draggedNewCard,
    setSelectedIds,
    isSelectionMode,
    setIsSelectionMode,
  };
}
