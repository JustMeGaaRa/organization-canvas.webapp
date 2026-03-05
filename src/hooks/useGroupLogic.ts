import type { TrackData, Role } from "../types";
import { useHistoryStore } from "../store/useHistoryStore";
import { getTrackBoundsFromCards } from "../utils/trackBounds";

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
      const bounds = getTrackBoundsFromCards(selectedCards);
      const newTrack: TrackData = {
        id: `track-${Date.now()}`,
        ...bounds,
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
