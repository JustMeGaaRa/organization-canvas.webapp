import { useState, useRef, useEffect, useCallback } from "react";
import type { Role, TrackData, Transform, Point } from "../../types";
import { useHistoryStore } from "../../store/useHistoryStore";
import {
  GRID_SIZE,
  CARD_WIDTH_LARGE,
  CARD_WIDTH_SMALL,
  CARD_HEIGHT_LARGE,
  CARD_HEIGHT_SMALL,
} from "../../constants";
import { getTrackBoundsFromCards } from "../../utils/trackBounds";

export function useCanvasDrag(
  cardsRef: React.MutableRefObject<Role[]>,
  tracksRef: React.MutableRefObject<TrackData[]>,
  setCards: React.Dispatch<React.SetStateAction<Role[]>>,
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>,
  transformRef: React.MutableRefObject<Transform>,
  toolModeRef: React.MutableRefObject<string>,
  selectedIdsRef: React.MutableRefObject<string[]>,
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  isSelectionModeRef: React.MutableRefObject<boolean>,
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>,
  primaryPointerIdRef: React.MutableRefObject<number | null>,
  longPressTimerRef: React.MutableRefObject<number | null>,
  dragStartPointRef: React.MutableRefObject<{ x: number; y: number } | null>,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<
    "card" | "track" | "track-create" | "new-card" | null
  >(null);
  const [draggedNewCard, setDraggedNewCard] = useState<Role | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dropTargetTrackId, setDropTargetTrackId] = useState<string | null>(
    null,
  );

  const draggingIdRef = useRef(draggingId);
  const draggingTypeRef = useRef(draggingType);
  const draggedNewCardRef = useRef(draggedNewCard);
  const offsetRef = useRef(offset);
  const initialPositionsRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );

  useEffect(() => {
    draggingIdRef.current = draggingId;
  }, [draggingId]);
  useEffect(() => {
    draggingTypeRef.current = draggingType;
  }, [draggingType]);
  useEffect(() => {
    draggedNewCardRef.current = draggedNewCard;
  }, [draggedNewCard]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const handleStartDragCard = useCallback(
    (e: React.PointerEvent, cardId: string) => {
      if (toolModeRef.current !== "select") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (
        primaryPointerIdRef.current !== null &&
        primaryPointerIdRef.current !== e.pointerId
      )
        return;

      e.stopPropagation();
      primaryPointerIdRef.current = e.pointerId;

      let finalSelectedIds = selectedIdsRef.current;

      if (isSelectionModeRef.current) {
        if (!finalSelectedIds.includes(cardId)) {
          finalSelectedIds = [...finalSelectedIds, cardId];
        }
      } else {
        dragStartPointRef.current = { x: e.clientX, y: e.clientY };

        if ((e.ctrlKey || e.metaKey) && e.pointerType === "mouse") {
          if (finalSelectedIds.includes(cardId)) {
            finalSelectedIds = finalSelectedIds.filter((id) => id !== cardId);
            setSelectedIds(finalSelectedIds);
            primaryPointerIdRef.current = null;
            if (finalSelectedIds.length === 0) setIsSelectionMode(false);
            return;
          } else {
            finalSelectedIds = [...finalSelectedIds, cardId];
            setIsSelectionMode(true);
          }
        } else {
          if (!finalSelectedIds.includes(cardId)) {
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

      const card = cardsRef.current.find((c) => c.id === cardId);
      if (!card) return;

      const transform = transformRef.current;
      setDraggingId(cardId);
      setDraggingType("card");
      const newOffset = {
        x: e.clientX / transform.scale - card.x,
        y: e.clientY / transform.scale - card.y,
      };
      setOffset(newOffset);

      // Capture initial positions for multi-drag
      const initialPos: Record<string, { x: number; y: number }> = {};
      const cardsMap = new Map(cardsRef.current.map((c) => [c.id, c]));

      tracksRef.current.forEach((t) => {
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
      cardsRef.current.forEach((c) => {
        if (activeSelectedIds.includes(c.id)) {
          initialPos[c.id] = { x: c.x, y: c.y };
        }
      });
      initialPositionsRef.current = initialPos;
    },
    [
      cardsRef,
      tracksRef,
      toolModeRef,
      setSelectedIds,
      setIsSelectionMode,
      selectedIdsRef,
      isSelectionModeRef,
      primaryPointerIdRef,
      longPressTimerRef,
      dragStartPointRef,
      transformRef,
    ],
  );

  const handleStartDragTrack = useCallback(
    (e: React.PointerEvent, trackId: string) => {
      if (toolModeRef.current !== "select") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (
        primaryPointerIdRef.current !== null &&
        primaryPointerIdRef.current !== e.pointerId
      )
        return;

      e.stopPropagation();
      primaryPointerIdRef.current = e.pointerId;

      let finalSelectedIds = selectedIdsRef.current;

      if (isSelectionModeRef.current) {
        if (!finalSelectedIds.includes(trackId)) {
          finalSelectedIds = [...finalSelectedIds, trackId];
        }
      } else {
        dragStartPointRef.current = { x: e.clientX, y: e.clientY };

        if ((e.ctrlKey || e.metaKey) && e.pointerType === "mouse") {
          if (finalSelectedIds.includes(trackId)) {
            finalSelectedIds = finalSelectedIds.filter((id) => id !== trackId);
            setSelectedIds(finalSelectedIds);
            primaryPointerIdRef.current = null;
            if (finalSelectedIds.length === 0) setIsSelectionMode(false);
            return;
          } else {
            finalSelectedIds = [...finalSelectedIds, trackId];
            setIsSelectionMode(true);
          }
        } else {
          if (!finalSelectedIds.includes(trackId)) {
            finalSelectedIds = [trackId];
          }

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
      }
      setSelectedIds(finalSelectedIds);
      const activeSelectedIds = finalSelectedIds;

      const track = tracksRef.current.find((t) => t.id === trackId);
      if (!track) return;

      const transform = transformRef.current;
      setDraggingId(trackId);
      setDraggingType("track");
      const newOffset = {
        x: e.clientX / transform.scale - track.x,
        y: e.clientY / transform.scale - track.y,
      };
      setOffset(newOffset);

      const initialPos: Record<string, { x: number; y: number }> = {};
      const cardsMap = new Map(cardsRef.current.map((c) => [c.id, c]));

      tracksRef.current.forEach((t) => {
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
      cardsRef.current.forEach((c) => {
        if (activeSelectedIds.includes(c.id)) {
          initialPos[c.id] = { x: c.x, y: c.y };
        }
      });

      initialPositionsRef.current = initialPos;
    },
    [
      cardsRef,
      tracksRef,
      toolModeRef,
      setSelectedIds,
      setIsSelectionMode,
      selectedIdsRef,
      isSelectionModeRef,
      primaryPointerIdRef,
      longPressTimerRef,
      dragStartPointRef,
      transformRef,
    ],
  );

  const startDragNewCard = useCallback(
    (e: React.PointerEvent, newCard: Role) => {
      if (
        primaryPointerIdRef.current !== null &&
        primaryPointerIdRef.current !== e.pointerId
      )
        return;
      primaryPointerIdRef.current = e.pointerId;

      setDraggingId(newCard.id);
      setDraggingType("new-card");
      setDraggedNewCard(newCard);

      const transform = transformRef.current;
      const mouseX = e.clientX / transform.scale;
      const mouseY = e.clientY / transform.scale;

      const newOffset = {
        x: mouseX - newCard.x,
        y: mouseY - newCard.y,
      };
      setOffset(newOffset);
    },
    [primaryPointerIdRef, transformRef],
  );

  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      const draggingId = draggingIdRef.current;
      if (!draggingId) return false;

      const draggingType = draggingTypeRef.current;
      const transform = transformRef.current;
      const offset = offsetRef.current;

      const newMouseX =
        Math.round((clientX / transform.scale - offset.x) / GRID_SIZE) *
        GRID_SIZE;
      const newMouseY =
        Math.round((clientY / transform.scale - offset.y) / GRID_SIZE) *
        GRID_SIZE;

      if (draggingType === "new-card") {
        const draggedNewCard = draggedNewCardRef.current;
        if (draggedNewCard) {
          const updatedCard = { ...draggedNewCard, x: newMouseX, y: newMouseY };
          setDraggedNewCard(updatedCard);
          // Compute hover track for new-card
          const cw =
            updatedCard.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
          const ch =
            updatedCard.size === "small"
              ? CARD_HEIGHT_SMALL
              : CARD_HEIGHT_LARGE;
          const centerX = newMouseX + cw / 2;
          const centerY = newMouseY + ch / 2;
          const currentTracks = tracksRef.current;
          let hoverTrack: string | null = null;
          for (let i = currentTracks.length - 1; i >= 0; i--) {
            const t = currentTracks[i];
            if (
              centerX >= t.x &&
              centerX <= t.x + t.width &&
              centerY >= t.y &&
              centerY <= t.y + t.height
            ) {
              hoverTrack = t.id;
              break;
            }
          }
          setDropTargetTrackId(hoverTrack);
        }
        return true;
      }

      if (draggingType === "card" || draggingType === "track") {
        const initialPositions = initialPositionsRef.current;
        const leaderInitial = initialPositions[draggingId];

        if (!leaderInitial) {
          return true;
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

          // Compute which track the dragged card(s) center is currently over
          if (draggingType === "card") {
            const movedCards = nextCards.filter((c) => initialPositions[c.id]);
            if (movedCards.length > 0) {
              let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
              movedCards.forEach((c) => {
                const cw =
                  c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
                const ch =
                  c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE;
                minX = Math.min(minX, c.x);
                minY = Math.min(minY, c.y);
                maxX = Math.max(maxX, c.x + cw);
                maxY = Math.max(maxY, c.y + ch);
              });
              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;
              const currentTracks = tracksRef.current;
              let hoverTrack: string | null = null;
              for (let i = currentTracks.length - 1; i >= 0; i--) {
                const t = currentTracks[i];
                if (
                  centerX >= t.x &&
                  centerX <= t.x + t.width &&
                  centerY >= t.y &&
                  centerY <= t.y + t.height
                ) {
                  const containsAll = movedCards.every((c) =>
                    t.containedCardIds?.includes(c.id),
                  );
                  if (!containsAll) {
                    hoverTrack = t.id;
                    break;
                  }
                }
              }
              setDropTargetTrackId(hoverTrack);
            }
          }
        }

        setTracks((prevTracks) => {
          return prevTracks.map((t) => {
            if (t.containedCardIds && t.containedCardIds.length > 0) {
              const contained = nextCards.filter((c) =>
                t.containedCardIds!.includes(c.id),
              );
              if (contained.length === 0) return t;

              const bounds = getTrackBoundsFromCards(contained);
              return { ...t, ...bounds };
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
        return true;
      }
      return false;
    },
    [cardsRef, tracksRef, setCards, setTracks, transformRef],
  );

  const stopDrag = useCallback(
    (clientX: number, clientY: number, isOverDeleteZone: boolean) => {
      const draggingId = draggingIdRef.current;
      if (!draggingId) return false;

      const draggingType = draggingTypeRef.current;
      const initialPositions = initialPositionsRef.current;

      if (isOverDeleteZone) {
        if (draggingType === "card") {
          const draggedIds = Object.keys(initialPositions);
          if (draggedIds.length > 0) {
            setCards((prev) => {
              const newCards = prev.filter((c) => !draggedIds.includes(c.id));
              useHistoryStore
                .getState()
                .commitHistory(newCards, tracksRef.current);
              return newCards;
            });
            setSelectedIds([]);
          } else {
            setCards((prev) => {
              const newCards = prev.filter((c) => c.id !== draggingId);
              useHistoryStore
                .getState()
                .commitHistory(newCards, tracksRef.current);
              return newCards;
            });
          }
        } else {
          setTracks((prev) => {
            const newTracks = prev.filter((t) => t.id !== draggingId);
            useHistoryStore
              .getState()
              .commitHistory(cardsRef.current, newTracks);
            return newTracks;
          });
        }
      } else {
        let targetTrackId: string | null = null;
        let draggedCards: Role[] = [];

        if (draggingType === "card") {
          draggedCards = cardsRef.current.filter((c) =>
            Object.keys(initialPositions).includes(c.id),
          );
        } else if (draggingType === "new-card" && draggedNewCardRef.current) {
          draggedCards = [draggedNewCardRef.current];
        }

        if (draggedCards.length > 0) {
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
          draggedCards.forEach((c) => {
            const cw = c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
            const ch =
              c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE;
            minX = Math.min(minX, c.x);
            minY = Math.min(minY, c.y);
            maxX = Math.max(maxX, c.x + cw);
            maxY = Math.max(maxY, c.y + ch);
          });
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;

          const currentTracks = tracksRef.current;
          for (let i = currentTracks.length - 1; i >= 0; i--) {
            const t = currentTracks[i];
            if (
              centerX >= t.x &&
              centerX <= t.x + t.width &&
              centerY >= t.y &&
              centerY <= t.y + t.height
            ) {
              const containsAll = draggedCards.every((c) =>
                t.containedCardIds?.includes(c.id),
              );
              if (!containsAll) {
                targetTrackId = t.id;
                break;
              }
            }
          }
        }

        let finalTracks = tracksRef.current;
        let finalCards = cardsRef.current;

        if (draggingType === "new-card" && draggedNewCardRef.current) {
          finalCards = [...cardsRef.current, draggedNewCardRef.current];
          setCards(finalCards);
          setDraggedNewCard(null);
        }

        if (targetTrackId && draggedCards.length > 0) {
          const draggedCardIds = draggedCards.map((c) => c.id);

          finalTracks = finalTracks.map((t) => {
            if (t.id !== targetTrackId && t.containedCardIds) {
              const newContained = t.containedCardIds.filter(
                (id) => !draggedCardIds.includes(id),
              );
              if (newContained.length !== t.containedCardIds.length) {
                return { ...t, containedCardIds: newContained };
              }
            }
            if (t.id === targetTrackId) {
              const newContained = Array.from(
                new Set([...(t.containedCardIds || []), ...draggedCardIds]),
              );
              return { ...t, containedCardIds: newContained };
            }
            return t;
          });

          finalTracks = finalTracks.map((t) => {
            if (t.containedCardIds && t.containedCardIds.length > 0) {
              const contained = finalCards.filter((c) =>
                t.containedCardIds!.includes(c.id),
              );
              if (contained.length > 0) {
                return {
                  ...t,
                  ...getTrackBoundsFromCards(contained),
                };
              } else {
                return { ...t, containedCardIds: [] };
              }
            }
            return t;
          });

          setTracks(finalTracks);
        }

        if (
          draggingType !== "new-card" &&
          isSelectionModeRef.current &&
          dragStartPointRef.current
        ) {
          // Toggle selection logic if just clicked without moving much
          const dist = Math.hypot(
            clientX - dragStartPointRef.current.x,
            clientY - dragStartPointRef.current.y,
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
          } else {
            useHistoryStore.getState().commitHistory(finalCards, finalTracks);
          }
        } else {
          useHistoryStore.getState().commitHistory(finalCards, finalTracks);
        }
      }

      setDraggingId(null);
      setDraggingType(null);
      setDropTargetTrackId(null);
      initialPositionsRef.current = {};

      return true;
    },
    [
      setCards,
      setTracks,
      setSelectedIds,
      setIsSelectionMode,
      selectedIdsRef,
      isSelectionModeRef,
      dragStartPointRef,
      cardsRef,
      tracksRef,
    ],
  );

  return {
    draggingId,
    draggingType,
    draggedNewCard,
    dropTargetTrackId,
    handleStartDragCard,
    handleStartDragTrack,
    startDragNewCard,
    updateDrag,
    stopDrag,
  };
}
