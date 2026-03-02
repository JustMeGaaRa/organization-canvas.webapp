import { create } from "zustand";
import type { Role, TrackData } from "../types";

export interface HistoryState {
  cards: Role[];
  tracks: TrackData[];
}

const MAX_HISTORY_LENGTH = 50;

interface HistoryStore {
  history: HistoryState[];
  currentIndex: number;

  commitHistory: (cards: Role[], tracks: TrackData[]) => void;
  undo: (
    setCards: (cards: Role[]) => void,
    setTracks: (tracks: TrackData[]) => void,
  ) => void;
  redo: (
    setCards: (cards: Role[]) => void,
    setTracks: (tracks: TrackData[]) => void,
  ) => void;
  reset: () => void;
}

const stripCard = (c: Role) => ({
  id: c.id,
  x: c.x,
  y: c.y,
  assignedPerson: c.assignedPerson,
});

const stripTrack = (t: TrackData) => ({
  id: t.id,
  x: t.x,
  y: t.y,
  width: t.width,
  height: t.height,
  containedCardIds: t.containedCardIds,
});

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  // Initialize with an empty array. The CanvasPage will commit an initial state on mount if it's empty.
  history: [],
  currentIndex: -1,

  commitHistory: (newCards: Role[], newTracks: TrackData[]) => {
    set((state) => {
      // If history is empty, initialize it.
      if (state.history.length === 0) {
        return {
          history: [{ cards: newCards, tracks: newTracks }],
          currentIndex: 0,
        };
      }

      let activeHistory = state.history;
      if (state.currentIndex < state.history.length - 1) {
        activeHistory = state.history.slice(0, state.currentIndex + 1);
      }

      const lastState = activeHistory[activeHistory.length - 1];
      if (lastState) {
        const lastStrippedCards = lastState.cards.map(stripCard);
        const lastStrippedTracks = lastState.tracks.map(stripTrack);
        const currentStrippedCards = newCards.map(stripCard);
        const currentStrippedTracks = newTracks.map(stripTrack);

        // Deduplication
        if (
          JSON.stringify(lastStrippedCards) ===
            JSON.stringify(currentStrippedCards) &&
          JSON.stringify(lastStrippedTracks) ===
            JSON.stringify(currentStrippedTracks)
        ) {
          return {}; // No change necessary
        }
      }

      const newState = [
        ...activeHistory,
        { cards: newCards, tracks: newTracks },
      ];

      if (newState.length > MAX_HISTORY_LENGTH) {
        newState.shift();
      }

      return {
        history: newState,
        currentIndex: newState.length - 1,
      };
    });
  },

  undo: (setCards, setTracks) => {
    const { currentIndex, history } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevState = history[prevIndex];
      setCards(prevState.cards);
      setTracks(prevState.tracks);
      set({ currentIndex: prevIndex });
    }
  },

  redo: (setCards, setTracks) => {
    const { currentIndex, history } = get();
    if (currentIndex >= 0 && currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextState = history[nextIndex];
      setCards(nextState.cards);
      setTracks(nextState.tracks);
      set({ currentIndex: nextIndex });
    }
  },

  reset: () => {
    set({ history: [], currentIndex: -1 });
  },
}));
