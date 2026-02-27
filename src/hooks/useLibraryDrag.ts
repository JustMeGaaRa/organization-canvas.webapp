import { useState, useEffect, useRef } from "react";
import type { Person, RoleTemplate, Role } from "../types";
import { GRID_SIZE, CARD_WIDTH_LARGE, CARD_HEIGHT_LARGE } from "../constants";

export type DraggedLibraryItem =
  | { type: "person"; data: Person }
  | { type: "role"; data: RoleTemplate };

export interface LibraryDragState {
  item: DraggedLibraryItem;
  x: number;
  y: number;
  pointerId: number;
  overCardId: string | null;
}

export function useLibraryDrag(
  setCards: React.Dispatch<React.SetStateAction<Role[]>>,
  transform: { x: number; y: number; scale: number },
  canvasRef: React.RefObject<HTMLDivElement | null>,
) {
  const [libraryDrag, setLibraryDrag] = useState<LibraryDragState | null>(null);
  const libraryDragRef = useRef(libraryDrag);
  const transformRef = useRef(transform);

  useEffect(() => {
    libraryDragRef.current = libraryDrag;
  }, [libraryDrag]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    if (!libraryDrag) return;
    const currentPointerId = libraryDrag.pointerId;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== currentPointerId) return;
      if (e.cancelable) {
        e.preventDefault();
      }

      let overCardId: string | null = null;
      if (libraryDrag.item.type === "person") {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        for (const el of elements) {
          const cardEl = (el as HTMLElement).closest("[data-card-id]");
          if (cardEl) {
            overCardId = cardEl.getAttribute("data-card-id");
            break;
          }
        }
      }

      setLibraryDrag((prev) =>
        prev ? { ...prev, x: e.clientX, y: e.clientY, overCardId } : null,
      );
    };

    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== currentPointerId) return;

      const currentDragState = libraryDragRef.current;
      if (!currentDragState) return;

      const { item, x, y } = currentDragState;

      if (item.type === "person") {
        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
          const cardEl = (el as HTMLElement).closest("[data-card-id]");
          if (cardEl) {
            const cardId = cardEl.getAttribute("data-card-id");
            if (cardId) {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === cardId
                    ? {
                        ...c,
                        assignedPerson: item.data as Person,
                        status: "suggested" as const,
                      }
                    : c,
                ),
              );
              break;
            }
          }
        }
      } else if (item.type === "role") {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          if (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
          ) {
            const t = transformRef.current;
            const mouseX = (x - rect.left - t.x) / t.scale;
            const mouseY = (y - rect.top - t.y) / t.scale;

            const cardX = mouseX - CARD_WIDTH_LARGE / 2;
            const cardY = mouseY - CARD_HEIGHT_LARGE / 2;

            const snappedX = Math.round(cardX / GRID_SIZE) * GRID_SIZE;
            const snappedY = Math.round(cardY / GRID_SIZE) * GRID_SIZE;

            const newCard: Role = {
              ...(item.data as RoleTemplate),
              id: `${Date.now()}`,
              x: snappedX,
              y: snappedY,
              assignedPerson: undefined,
              status: "unassigned",
              size: "large",
            };

            setCards((prev) => [...prev, newCard]);
          }
        }
      }

      setLibraryDrag(null);
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [libraryDrag, setCards, canvasRef]); // Keep this explicit matching structure

  return { libraryDrag, setLibraryDrag };
}
