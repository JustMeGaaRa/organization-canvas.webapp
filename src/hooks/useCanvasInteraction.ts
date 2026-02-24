import { useState, useRef, useEffect, useCallback } from "react";
import type { Role, TrackData, Transform, Point } from "../types";
import {
  GRID_SIZE,
  TRACK_PADDING,
  CARD_WIDTH_LARGE,
  CARD_WIDTH_SMALL,
  CARD_HEIGHT_LARGE,
  CARD_HEIGHT_SMALL,
} from "../constants";

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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<
    "card" | "track" | "track-create" | "new-card" | null
  >(null);
  const [draggedNewCard, setDraggedNewCard] = useState<Role | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizingSide, setResizingSide] = useState<
    "top" | "bottom" | "left" | "right" | null
  >(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initialPositionsRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );

  // Refs for values accessed in event listeners to avoid re-attaching listeners
  const transformRef = useRef(transform);
  const offsetRef = useRef(offset);
  const lastPanPointRef = useRef(lastPanPoint);
  const isPanningRef = useRef(isPanning);
  const draggingIdRef = useRef(draggingId);
  const draggingTypeRef = useRef(draggingType);
  const resizingIdRef = useRef(resizingId);
  const resizingSideRef = useRef(resizingSide);
  const isOverDeleteZoneRef = useRef(isOverDeleteZone);
  const cardsRef = useRef(cards);
  const tracksRef = useRef(tracks);
  const selectedIdsRef = useRef(selectedIds);
  const clipboardRef = useRef<
    { type: "card" | "track"; data: Role | TrackData }[]
  >([]);
  const draggedNewCardRef = useRef(draggedNewCard);

  // Multi-touch / pinch-zoom refs
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const lastPinchDistanceRef = useRef<number | null>(null);
  const lastPinchMidpointRef = useRef<Point | null>(null);
  const primaryPointerIdRef = useRef<number | null>(null);
  // For detecting background tap vs pan-drag on touch
  const backgroundTouchStartRef = useRef<Point | null>(null);
  const isSelectionModeRef = useRef(isSelectionMode);
  const longPressTimerRef = useRef<number | null>(null);
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);

  // Sync refs
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);
  useEffect(() => {
    lastPanPointRef.current = lastPanPoint;
  }, [lastPanPoint]);
  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);
  useEffect(() => {
    draggingIdRef.current = draggingId;
  }, [draggingId]);
  useEffect(() => {
    draggingTypeRef.current = draggingType;
  }, [draggingType]);
  useEffect(() => {
    resizingIdRef.current = resizingId;
  }, [resizingId]);
  useEffect(() => {
    resizingSideRef.current = resizingSide;
  }, [resizingSide]);
  useEffect(() => {
    isOverDeleteZoneRef.current = isOverDeleteZone;
  }, [isOverDeleteZone]);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);
  useEffect(() => {
    draggedNewCardRef.current = draggedNewCard;
  }, [draggedNewCard]);
  useEffect(() => {
    isSelectionModeRef.current = isSelectionMode;
  }, [isSelectionMode]);

  // Zoom Logic
  const handleZoom = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      setTransform((prev) => {
        const newScale = Math.min(Math.max(prev.scale + delta, 0.2), 3);
        if (newScale === prev.scale) return prev;
        const ratio = newScale / prev.scale;
        const x = centerX - (centerX - prev.x) * ratio;
        const y = centerY - (centerY - prev.y) * ratio;
        return { x, y, scale: newScale };
      });
    },
    [setTransform],
  );

  // Stable ref so pinch handler can call it without re-attaching listeners
  const handleZoomRef = useRef(handleZoom);
  useEffect(() => {
    handleZoomRef.current = handleZoom;
  }, [handleZoom]);

  const handleStartDragCard = (e: React.PointerEvent, cardId: string) => {
    if (toolMode !== "select") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (
      primaryPointerIdRef.current !== null &&
      primaryPointerIdRef.current !== e.pointerId
    )
      return;

    e.stopPropagation();
    primaryPointerIdRef.current = e.pointerId;

    let finalSelectedIds = selectedIds;

    if (isSelectionModeRef.current) {
      if (selectedIds.includes(cardId)) {
        // If clicking an already selected card, just drag ALL selected cards.
        // Deselection happens on click (pointerUp without moving) or we can just leave it to toggle on up,
        // but for now, to support drag, we DO NOT toggle selection here if it's already selected.
        // We'll just initiate the drag.
      } else {
        finalSelectedIds = [...selectedIds, cardId];
      }
    } else {
      dragStartPointRef.current = { x: e.clientX, y: e.clientY };

      // Selection Logic
      if ((e.ctrlKey || e.metaKey) && e.pointerType === "mouse") {
        if (selectedIds.includes(cardId)) {
          finalSelectedIds = selectedIds.filter((id) => id !== cardId);
          setSelectedIds(finalSelectedIds);
          primaryPointerIdRef.current = null;
          if (finalSelectedIds.length === 0) setIsSelectionMode(false);
          return;
        } else {
          finalSelectedIds = [...selectedIds, cardId];
          setIsSelectionMode(true);
        }
      } else {
        if (!selectedIds.includes(cardId)) {
          finalSelectedIds = [cardId];
        }

        if (!isSelectionModeRef.current) {
          longPressTimerRef.current = window.setTimeout(() => {
            setIsSelectionMode(true);
            setSelectedIds((prev) =>
              prev.includes(cardId) ? prev : [...prev, cardId],
            );
            setDraggingId(null);
            setDraggingType(null);
            longPressTimerRef.current = null;
            primaryPointerIdRef.current = null;
          }, 500);
        }
      }
    }
    setSelectedIds(finalSelectedIds);

    const activeSelectedIds = finalSelectedIds;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setDraggingId(cardId);
    draggingIdRef.current = cardId;
    setDraggingType("card");
    draggingTypeRef.current = "card";
    const newOffset = {
      x: e.clientX / transform.scale - card.x,
      y: e.clientY / transform.scale - card.y,
    };
    setOffset(newOffset);
    offsetRef.current = newOffset;

    // Capture initial positions for all selected cards and tracks for multi-drag
    const initialPos: Record<string, { x: number; y: number }> = {};
    cards.forEach((c) => {
      if (activeSelectedIds.includes(c.id)) {
        initialPos[c.id] = { x: c.x, y: c.y };
      }
    });
    tracks.forEach((t) => {
      if (activeSelectedIds.includes(t.id)) {
        initialPos[t.id] = { x: t.x, y: t.y };
      }
    });
    initialPositionsRef.current = initialPos;
  };

  const handleStartDragTrack = (e: React.PointerEvent, trackId: string) => {
    if (toolMode !== "select") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (
      primaryPointerIdRef.current !== null &&
      primaryPointerIdRef.current !== e.pointerId
    )
      return;

    e.stopPropagation();
    primaryPointerIdRef.current = e.pointerId;

    if (isSelectionModeRef.current) {
      let newSelectedIds = selectedIds;
      if (selectedIds.includes(trackId)) {
        // Just dragging, no selection toggle on pointerDown
      } else {
        newSelectedIds = [...selectedIds, trackId];
        setSelectedIds(newSelectedIds);
      }
    } else {
      dragStartPointRef.current = { x: e.clientX, y: e.clientY };

      // Selection Logic for Non-Selection Mode
      let newSelectedIds = selectedIds;
      if ((e.ctrlKey || e.metaKey) && e.pointerType === "mouse") {
        if (selectedIds.includes(trackId)) {
          newSelectedIds = selectedIds.filter((id) => id !== trackId);
          setSelectedIds(newSelectedIds);
          primaryPointerIdRef.current = null;
          if (newSelectedIds.length === 0) setIsSelectionMode(false);
          return;
        } else {
          newSelectedIds = [...selectedIds, trackId];
          setIsSelectionMode(true);
        }
      } else {
        if (!selectedIds.includes(trackId)) {
          newSelectedIds = [trackId];
        }
      }
      setSelectedIds(newSelectedIds);

      if (!isSelectionModeRef.current) {
        longPressTimerRef.current = window.setTimeout(() => {
          setIsSelectionMode(true);
          setSelectedIds((prev) =>
            prev.includes(trackId) ? prev : [...prev, trackId],
          );
          setDraggingId(null);
          setDraggingType(null);
          longPressTimerRef.current = null;
          primaryPointerIdRef.current = null;
        }, 500);
      }
    }

    // Capture the current selected state to use for dragging positions
    const activeSelectedIds = selectedIdsRef.current;

    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    setDraggingId(trackId);
    draggingIdRef.current = trackId;
    setDraggingType("track");
    draggingTypeRef.current = "track";
    const newOffset = {
      x: e.clientX / transform.scale - track.x,
      y: e.clientY / transform.scale - track.y,
    };
    setOffset(newOffset);
    offsetRef.current = newOffset;

    // Capture initial positions for all selected tracks or cards
    const initialPos: Record<string, { x: number; y: number }> = {};
    const cardsMap = new Map(cards.map((c) => [c.id, c]));

    tracks.forEach((t) => {
      if (activeSelectedIds.includes(t.id)) {
        initialPos[t.id] = { x: t.x, y: t.y };
        t.containedCardIds?.forEach((cid) => {
          const card = cardsMap.get(cid);
          if (card) {
            initialPos[cid] = { x: card.x, y: card.y };
          }
        });
      }
    });
    cards.forEach((c) => {
      if (activeSelectedIds.includes(c.id)) {
        initialPos[c.id] = { x: c.x, y: c.y };
      }
    });

    initialPositionsRef.current = initialPos;
  };

  const handleResizeStart = (
    e: React.PointerEvent,
    trackId: string,
    side: "top" | "bottom" | "left" | "right",
  ) => {
    e.stopPropagation();
    if (
      primaryPointerIdRef.current !== null &&
      primaryPointerIdRef.current !== e.pointerId
    )
      return;
    primaryPointerIdRef.current = e.pointerId;
    setResizingId(trackId);
    resizingIdRef.current = trackId;
    setResizingSide(side);
    resizingSideRef.current = side;
  };

  // Main pointer move handler (window level)
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Update active pointers (only those tracked from canvas)
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      // Two-finger pinch + pan (takes priority over single-touch)
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
          // Pinch zoom
          const zoomDelta = (distance - lastPinchDistanceRef.current) * 0.003;
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            handleZoomRef.current(zoomDelta, midX - rect.left, midY - rect.top);
          }
          // Pan from midpoint movement
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

      // Only respond to primary pointer for single-touch operations
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

      // Background touch: lazy pan start (wait for movement threshold)
      const bgTouchStart = backgroundTouchStartRef.current;
      if (bgTouchStart) {
        const dist = Math.hypot(
          e.clientX - bgTouchStart.x,
          e.clientY - bgTouchStart.y,
        );
        if (dist > 5) {
          setIsPanning(true);
          isPanningRef.current = true;
          setLastPanPoint({ x: e.clientX, y: e.clientY });
          lastPanPointRef.current = { x: e.clientX, y: e.clientY };
          backgroundTouchStartRef.current = null;
        } else {
          return; // Hasn't moved enough yet
        }
      }

      // Handle Panning
      if (isPanningRef.current) {
        const lastPanPoint = lastPanPointRef.current;
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const resizingId = resizingIdRef.current;

      // Handle Resizing
      if (resizingId) {
        const resizingSide = resizingSideRef.current;
        const transform = transformRef.current;
        const mouseX = (e.clientX - transform.x) / transform.scale;
        const mouseY = (e.clientY - transform.y) / transform.scale;

        setTracks((prev) =>
          prev.map((t) => {
            if (t.id !== resizingId) return t;
            const newT = { ...t };
            const gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
            const gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;

            if (resizingSide === "right")
              newT.width = Math.max(100, gridX - t.x);
            if (resizingSide === "left") {
              const newWidth = t.width + (t.x - gridX);
              if (newWidth >= 100) {
                newT.x = gridX;
                newT.width = newWidth;
              }
            }
            if (resizingSide === "bottom")
              newT.height = Math.max(100, gridY - t.y);
            if (resizingSide === "top") {
              const newHeight = t.height + (t.y - gridY);
              if (newHeight >= 100) {
                newT.y = gridY;
                newT.height = newHeight;
              }
            }
            return newT;
          }),
        );
        return;
      }

      const draggingId = draggingIdRef.current;
      if (!draggingId) return;

      if (deleteZoneRef.current) {
        const dzRect = deleteZoneRef.current.getBoundingClientRect();
        const isOver =
          e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom;

        setIsOverDeleteZone(isOver);
        isOverDeleteZoneRef.current = isOver;
      }

      const offset = offsetRef.current;
      const draggingType = draggingTypeRef.current;
      const transform = transformRef.current;

      const newMouseX =
        Math.round((e.clientX / transform.scale - offset.x) / GRID_SIZE) *
        GRID_SIZE;
      const newMouseY =
        Math.round((e.clientY / transform.scale - offset.y) / GRID_SIZE) *
        GRID_SIZE;

      if (draggingType === "new-card") {
        const draggedNewCard = draggedNewCardRef.current;
        if (draggedNewCard) {
          const newMouseX =
            Math.round((e.clientX / transform.scale - offset.x) / GRID_SIZE) *
            GRID_SIZE;
          const newMouseY =
            Math.round((e.clientY / transform.scale - offset.y) / GRID_SIZE) *
            GRID_SIZE;

          setDraggedNewCard({
            ...draggedNewCard,
            x: newMouseX,
            y: newMouseY,
          });
        }
        return;
      }

      if (draggingType === "card" || draggingType === "track") {
        const initialPositions = initialPositionsRef.current;
        const leaderInitial = initialPositions[draggingId];

        if (!leaderInitial) {
          return;
        }

        const deltaX = newMouseX - leaderInitial.x;
        const deltaY = newMouseY - leaderInitial.y;

        let nextCards = cardsRef.current;
        const cardsChanged = nextCards.some((c) => initialPositions[c.id]);

        if (cardsChanged) {
          nextCards = nextCards.map((c) => {
            if (initialPositions[c.id]) {
              return {
                ...c,
                x: initialPositions[c.id].x + deltaX,
                y: initialPositions[c.id].y + deltaY,
              };
            }
            return c;
          });
          setCards(nextCards);
        }

        setTracks((prevTracks) => {
          return prevTracks.map((t) => {
            if (t.containedCardIds && t.containedCardIds.length > 0) {
              const contained = nextCards.filter((c) =>
                t.containedCardIds!.includes(c.id),
              );
              if (contained.length === 0) return t;

              const minX = Math.min(...contained.map((c) => c.x));
              const minY = Math.min(...contained.map((c) => c.y));

              let maxRight = -Infinity;
              let maxBottom = -Infinity;

              contained.forEach((c) => {
                const cW =
                  c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
                const cH =
                  c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE;
                maxRight = Math.max(maxRight, c.x + cW);
                maxBottom = Math.max(maxBottom, c.y + cH);
              });
              return {
                ...t,
                x: minX - TRACK_PADDING,
                y: minY - TRACK_PADDING,
                width: maxRight - minX + TRACK_PADDING * 2,
                height: maxBottom - minY + TRACK_PADDING * 2,
              };
            }

            if (initialPositions[t.id]) {
              return {
                ...t,
                x: initialPositions[t.id].x + deltaX,
                y: initialPositions[t.id].y + deltaY,
              };
            }

            return t;
          });
        });
      }
    },
    [setCards, setTracks, setTransform, deleteZoneRef, canvasRef],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      // Update pointer tracking
      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size < 2) {
        lastPinchDistanceRef.current = null;
        lastPinchMidpointRef.current = null;
      }

      // Only continue cleanup for the primary pointer
      if (e.pointerId !== primaryPointerIdRef.current) return;
      primaryPointerIdRef.current = null;

      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Background tap detection: no movement = clear selection
      if (backgroundTouchStartRef.current) {
        setSelectedIds([]);
        backgroundTouchStartRef.current = null;
      }

      const draggingId = draggingIdRef.current;
      const draggingType = draggingTypeRef.current;
      const isOverDeleteZone = isOverDeleteZoneRef.current;
      const initialPositions = initialPositionsRef.current;

      if (draggingId) {
        if (isOverDeleteZone) {
          if (draggingType === "card") {
            const draggedIds = Object.keys(initialPositions);
            if (draggedIds.length > 0) {
              setCards((prev) =>
                prev.filter((c) => !draggedIds.includes(c.id)),
              );
              setSelectedIds([]);
            } else {
              setCards((prev) => prev.filter((c) => c.id !== draggingId));
            }
          } else setTracks((prev) => prev.filter((t) => t.id !== draggingId));
        } else if (draggingType === "track-create") {
          // logic removed
        } else if (draggingType === "new-card") {
          const draggedNewCard = draggedNewCardRef.current;
          if (draggedNewCard && !isOverDeleteZone) {
            setCards((prev) => [...prev, draggedNewCard]);
          }
          setDraggedNewCard(null);
        } else if (isSelectionModeRef.current && dragStartPointRef.current) {
          // If we are in selection mode, and we didn't drag it, toggle selection
          const dist = Math.hypot(
            e.clientX - dragStartPointRef.current.x,
            e.clientY - dragStartPointRef.current.y,
          );

          if (dist < 5) {
            const selected = selectedIdsRef.current;
            let newSelectedIds = selected;
            if (selected.includes(draggingId)) {
              newSelectedIds = selected.filter((id) => id !== draggingId);
            } else {
              newSelectedIds = [...selected, draggingId];
            }
            setSelectedIds(newSelectedIds);
            if (newSelectedIds.length === 0) setIsSelectionMode(false);
          }
        }
      }

      setDraggingId(null);
      setDraggingType(null);
      setResizingId(null);
      setResizingSide(null);
      setIsPanning(false);
      setIsOverDeleteZone(false);
      initialPositionsRef.current = {};
      dragStartPointRef.current = null;
    },
    [setCards, setTracks],
  );

  useEffect(() => {
    // Track pointer starts in capture phase so activePointersRef is up-to-date
    // when React synthetic handlers run. Only track pointers that start inside canvas.
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

  // Main canvas pointer down handler (background clicks/touches only —
  // cards and tracks stop propagation before this fires)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Mouse middle button = pan
    if (e.pointerType === "mouse" && e.button === 1) {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;
      setIsPanning(true);
      isPanningRef.current = true;
      const startPoint = { x: e.clientX, y: e.clientY };
      setLastPanPoint(startPoint);
      lastPanPointRef.current = startPoint;
      return;
    }

    // Pan mode: any pointer pans
    if (toolMode === "pan") {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;
      setIsPanning(true);
      isPanningRef.current = true;
      const startPoint = { x: e.clientX, y: e.clientY };
      setLastPanPoint(startPoint);
      lastPanPointRef.current = startPoint;
      return;
    }

    // Select mode background interaction
    if (toolMode === "select") {
      if (primaryPointerIdRef.current !== null) return;
      primaryPointerIdRef.current = e.pointerId;

      if (isSelectionModeRef.current) {
        setIsSelectionMode(false);
        setSelectedIds([]);
        primaryPointerIdRef.current = null;
        return;
      }

      if (e.pointerType !== "mouse") {
        // Touch on background: store start, will pan if moved or clear selection if tapped
        backgroundTouchStartRef.current = { x: e.clientX, y: e.clientY };
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Mouse click on background: clear selection immediately
        setSelectedIds([]);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (!canvasRef.current) return;
      e.preventDefault();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      handleZoom(
        -e.deltaY * 0.002,
        e.clientX - canvasRect.left,
        e.clientY - canvasRect.top,
      );
    } else {
      setTransform((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const startDragNewCard = (e: React.PointerEvent, newCard: Role) => {
    if (
      primaryPointerIdRef.current !== null &&
      primaryPointerIdRef.current !== e.pointerId
    )
      return;
    primaryPointerIdRef.current = e.pointerId;

    setDraggingId(newCard.id);
    draggingIdRef.current = newCard.id;
    setDraggingType("new-card");
    draggingTypeRef.current = "new-card";
    setDraggedNewCard(newCard);
    draggedNewCardRef.current = newCard;

    const mouseX = e.clientX / transform.scale;
    const mouseY = e.clientY / transform.scale;

    const newOffset = {
      x: mouseX - newCard.x,
      y: mouseY - newCard.y,
    };
    setOffset(newOffset);
    offsetRef.current = newOffset;
  };

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
        if (isSelectionModeRef.current) {
          setIsSelectionMode(false);
          setSelectedIds([]);
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = selectedIdsRef.current;
        if (selected.length > 0) {
          setCards((prev) => prev.filter((c) => !selected.includes(c.id)));
          setTracks((prev) => prev.filter((t) => !selected.includes(t.id)));
          setSelectedIds([]);
          if (isSelectionModeRef.current) setIsSelectionMode(false);
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
  }, [setCards, setTracks]);

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
