import type { TrackData, Role } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";
import {
  TRACK_PADDING,
  CARD_WIDTH_LARGE,
  CARD_WIDTH_SMALL,
  CARD_HEIGHT_LARGE,
  CARD_HEIGHT_SMALL,
} from "../constants";

interface UseGroupLogicProps {
  cards: Role[];
  selectedIds: string[];
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setToolMode: (
    mode: "select" | "pan" | "track" | "record" | "present",
  ) => void;
}

export const useGroupLogic = ({
  cards,
  selectedIds,
  setTracks,
  setSelectedIds,
  setToolMode,
}: UseGroupLogicProps) => {
  const createGroup = () => {
    const selectedCards = cards.filter((c) => selectedIds.includes(c.id));
    if (selectedCards.length > 0) {
      // Group Logic
      let minX = Infinity;
      let minY = Infinity;
      let maxRight = -Infinity;
      let maxBottom = -Infinity;

      selectedCards.forEach((c) => {
        minX = Math.min(minX, c.x);
        minY = Math.min(minY, c.y);
        maxRight = Math.max(
          maxRight,
          c.x + (c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE),
        );
        maxBottom = Math.max(
          maxBottom,
          c.y + (c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE),
        );
      });
      const newTrack: TrackData = {
        id: `track-${Date.now()}`,
        x: minX - TRACK_PADDING,
        y: minY - TRACK_PADDING,
        width: maxRight - minX + TRACK_PADDING * 2,
        height: maxBottom - minY + TRACK_PADDING * 2,
        containedCardIds: selectedCards.map((c) => c.id),
        name: "Group",
      };

      setTracks((prev) => {
        const result = [...prev, newTrack];
        useHistoryStore.getState().commitHistory(cards, result);
        return result;
      });
      setSelectedIds([newTrack.id]);
      setToolMode("select");
    } else {
      alert("Please select cards to create a group.");
      setToolMode("select");
    }
  };

  return { createGroup };
};
