import { useState, useEffect } from "react";
import type { Role, TrackData, Transform, HistoryStep } from "../types";

function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function useCanvasData(currentOrgId: string) {
  // We can assume currentOrgId is stable for the session due to reload on switch
  const [cards, setCards] = usePersistedState<Role[]>(
    `org_${currentOrgId}_cards`,
    [],
  );
  const [tracks, setTracks] = usePersistedState<TrackData[]>(
    `org_${currentOrgId}_tracks`,
    [],
  );
  const [transform, setTransform] = usePersistedState<Transform>(
    `org_${currentOrgId}_transform`,
    { x: 0, y: 0, scale: 1 },
  );

  const [historySteps, setHistorySteps] = usePersistedState<HistoryStep[]>(
    `org_${currentOrgId}_history`,
    [],
  );

  return {
    cards,
    setCards,
    tracks,
    setTracks,
    transform,
    setTransform,
    historySteps,
    setHistorySteps,
  };
}
