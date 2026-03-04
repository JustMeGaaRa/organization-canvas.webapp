import { useState, useRef, useCallback } from "react";
import type { Transform, Role, TrackData } from "../../types";

export interface MarqueeRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useMarqueeSelection(
  transformRef: React.RefObject<Transform>,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  cardsRef: React.RefObject<Role[]>,
  tracksRef: React.RefObject<TrackData[]>,
  setSelectedIds: (ids: string[]) => void,
  setIsSelectionMode: (isSelectionMode: boolean) => void,
) {
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null);
  const marqueeRef = useRef<MarqueeRect | null>(null);

  const startMarquee = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current || !transformRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        (clientX - rect.left - transformRef.current.x) /
        transformRef.current.scale;
      const y =
        (clientY - rect.top - transformRef.current.y) /
        transformRef.current.scale;

      const newMarquee = { startX: x, startY: y, currentX: x, currentY: y };
      marqueeRef.current = newMarquee;
      setMarquee(newMarquee);
      setIsSelectionMode(true);
    },
    [canvasRef, transformRef, setIsSelectionMode],
  );

  const updateMarquee = useCallback(
    (clientX: number, clientY: number) => {
      if (!marqueeRef.current || !canvasRef.current || !transformRef.current)
        return false;
      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        (clientX - rect.left - transformRef.current.x) /
        transformRef.current.scale;
      const y =
        (clientY - rect.top - transformRef.current.y) /
        transformRef.current.scale;

      const dist = Math.hypot(
        x - marqueeRef.current.startX,
        y - marqueeRef.current.startY,
      );
      if (dist > 5) {
        marqueeRef.current = {
          ...marqueeRef.current,
          currentX: x,
          currentY: y,
        };
        setMarquee(marqueeRef.current);

        const mqLeft = Math.min(
          marqueeRef.current.startX,
          marqueeRef.current.currentX,
        );
        const mqRight = Math.max(
          marqueeRef.current.startX,
          marqueeRef.current.currentX,
        );
        const mqTop = Math.min(
          marqueeRef.current.startY,
          marqueeRef.current.currentY,
        );
        const mqBottom = Math.max(
          marqueeRef.current.startY,
          marqueeRef.current.currentY,
        );

        const items: string[] = [];

        cardsRef.current?.forEach((card) => {
          const cw = card.size === "small" ? 224 : 256;
          const ch = card.size === "small" ? 120 : 256;
          if (
            card.x < mqRight &&
            card.x + cw > mqLeft &&
            card.y < mqBottom &&
            card.y + ch > mqTop
          ) {
            items.push(card.id);
          }
        });

        tracksRef.current?.forEach((track) => {
          if (
            track.x < mqRight &&
            track.x + track.width > mqLeft &&
            track.y < mqBottom &&
            track.y + track.height > mqTop
          ) {
            items.push(track.id);
          }
        });

        setSelectedIds(items);
      }
      return true;
    },
    [canvasRef, transformRef, cardsRef, tracksRef, setSelectedIds],
  );

  const stopMarquee = useCallback(() => {
    if (marqueeRef.current) {
      marqueeRef.current = null;
      setMarquee(null);
      return true;
    }
    return false;
  }, []);

  return { marquee, startMarquee, updateMarquee, stopMarquee };
}
