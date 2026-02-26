import { useState, useEffect, useRef } from "react";
import type { Person, Role } from "../types";

export interface PersonTouchDragState {
  person: Person;
  x: number;
  y: number;
  pointerId: number;
  overCardId: string | null;
}

export function usePersonAssignmentDrag(
  setCards: React.Dispatch<React.SetStateAction<Role[]>>,
) {
  const [personTouchDrag, setPersonTouchDrag] =
    useState<PersonTouchDragState | null>(null);
  const personTouchDragRef = useRef(personTouchDrag);

  // Sync ref
  useEffect(() => {
    personTouchDragRef.current = personTouchDrag;
  }, [personTouchDrag]);

  useEffect(() => {
    if (!personTouchDrag) return;
    // Capture the initial pointerId for this drag session.
    const currentPointerId = personTouchDrag.pointerId;

    // Use passive: false to allow preventDefault if needed, and bind to window
    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== currentPointerId) return;
      if (e.pointerType === "touch" && e.cancelable) {
        e.preventDefault();
      }

      // Hit-test: find card under the touch point (ghost has pointer-events:none)
      let overCardId: string | null = null;
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of elements) {
        const cardEl = (el as HTMLElement).closest("[data-card-id]");
        if (cardEl) {
          overCardId = cardEl.getAttribute("data-card-id");
          break;
        }
      }

      setPersonTouchDrag((prev) =>
        prev ? { ...prev, x: e.clientX, y: e.clientY, overCardId } : null,
      );
    };

    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== currentPointerId) return;

      const currentDragState = personTouchDragRef.current;
      if (!currentDragState) return;

      // Hit-test: find a role card under the touch point
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
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
                      assignedPerson: currentDragState.person,
                      status: "suggested" as const,
                    }
                  : c,
              ),
            );
            break;
          }
        }
      }

      setPersonTouchDrag(null);
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personTouchDrag ? true : false, setCards]);

  return { personTouchDrag, setPersonTouchDrag };
}
