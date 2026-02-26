import { useState, useRef, useEffect, useCallback } from "react";
import type { TrackData, Transform } from "../../types";
import { GRID_SIZE } from "../../constants";

export function useTrackResize(
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>,
  transformRef: React.MutableRefObject<Transform>,
  primaryPointerIdRef: React.MutableRefObject<number | null>,
) {
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizingSide, setResizingSide] = useState<
    "top" | "bottom" | "left" | "right" | null
  >(null);

  const resizingIdRef = useRef(resizingId);
  const resizingSideRef = useRef(resizingSide);

  useEffect(() => {
    resizingIdRef.current = resizingId;
  }, [resizingId]);
  useEffect(() => {
    resizingSideRef.current = resizingSide;
  }, [resizingSide]);

  const handleResizeStart = useCallback(
    (
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
    },
    [primaryPointerIdRef],
  );

  const updateResize = useCallback(
    (clientX: number, clientY: number) => {
      const resizingId = resizingIdRef.current;
      if (!resizingId) return false;

      const resizingSide = resizingSideRef.current;
      if (!transformRef.current) return false;
      const transform = transformRef.current;

      const mouseX = (clientX - transform.x) / transform.scale;
      const mouseY = (clientY - transform.y) / transform.scale;

      setTracks((prev) =>
        prev.map((t) => {
          if (t.id !== resizingId) return t;
          const newT = { ...t };
          const gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
          const gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;

          if (resizingSide === "right") newT.width = Math.max(100, gridX - t.x);
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
      return true; // Return true to indicate it was handled
    },
    [setTracks, transformRef],
  );

  const stopResize = useCallback(() => {
    setResizingId(null);
    setResizingSide(null);
  }, []);

  return {
    resizingId,
    resizingIdRef,
    resizingSide,
    resizingSideRef,
    handleResizeStart,
    updateResize,
    stopResize,
  };
}
