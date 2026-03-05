import {
  TRACK_PADDING,
  TRACK_EXTRA_PADDING,
  CARD_WIDTH_SMALL,
  CARD_WIDTH_LARGE,
  CARD_HEIGHT_SMALL,
  CARD_HEIGHT_LARGE,
} from "../constants";
import type { Role } from "../types";

/**
 * Returns a consistent { x, y, width, height } for a track bounding box,
 * applying extra padding based on orientation:
 *   - Horizontal (wider content)  → extra left/right padding
 *   - Vertical   (taller content) → extra top/bottom padding
 */
export function getTrackBoundsFromCards(cards: Role[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  cards.forEach((c) => {
    const cw = c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE;
    const ch = c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE;
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxRight = Math.max(maxRight, c.x + cw);
    maxBottom = Math.max(maxBottom, c.y + ch);
  });

  const contentW = maxRight - minX;
  const contentH = maxBottom - minY;

  // Horizontal group → extra padding on left/right so it's wider than vertical group
  const isHorizontal = contentW >= contentH;

  const padH = isHorizontal
    ? TRACK_PADDING + TRACK_EXTRA_PADDING
    : TRACK_PADDING;
  const padV = isHorizontal
    ? TRACK_PADDING
    : TRACK_PADDING + TRACK_EXTRA_PADDING;

  return {
    x: minX - padH,
    y: minY - padV,
    width: contentW + padH * 2,
    height: contentH + padV * 2,
  };
}
