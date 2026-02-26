import {
  CARD_WIDTH_LARGE,
  CARD_WIDTH_SMALL,
  CARD_HEIGHT_LARGE,
  CARD_HEIGHT_SMALL,
} from "../constants";
import type { Role, TrackData, Transform } from "../types";

export function useFitToScreen(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  cards: Role[],
  tracks: TrackData[],
  setTransform: React.Dispatch<React.SetStateAction<Transform>>,
) {
  const handleFitToScreen = () => {
    if (!canvasRef.current) return;
    if (cards.length === 0 && tracks.length === 0) {
      setTransform({ x: 0, y: 0, scale: 1 });
      return;
    }

    const viewportW = canvasRef.current.clientWidth;
    const viewportH = canvasRef.current.clientHeight;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    cards.forEach((card) => {
      const w = card.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
      const h = card.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE;
      minX = Math.min(minX, card.x);
      minY = Math.min(minY, card.y);
      maxX = Math.max(maxX, card.x + w);
      maxY = Math.max(maxY, card.y + h);
    });

    tracks.forEach((track) => {
      minX = Math.min(minX, track.x);
      minY = Math.min(minY, track.y);
      maxX = Math.max(maxX, track.x + track.width);
      maxY = Math.max(maxY, track.y + track.height);
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    if (contentW <= 0 || contentH <= 0) return;

    const PADDING = 96;
    const scaleX = (viewportW - PADDING * 2) / contentW;
    const scaleY = (viewportH - PADDING * 2) / contentH;
    const newScale = Math.max(0.05, Math.min(scaleX, scaleY, 3));

    const newX = (viewportW - contentW * newScale) / 2 - minX * newScale;
    const newY = (viewportH - contentH * newScale) / 2 - minY * newScale;
    setTransform({ x: newX, y: newY, scale: newScale });
  };

  return { handleFitToScreen };
}
