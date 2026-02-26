import { useState } from "react";
import type { Role, TrackData, Transform } from "../types";

export interface HistoryStep {
  timestamp: number;
  cards: Role[];
  tracks: TrackData[];
  transform: Transform;
}

export function useCanvasHistory(
  cards: Role[],
  tracks: TrackData[],
  transform: Transform,
  setCards: React.Dispatch<React.SetStateAction<Role[]>>,
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>,
  setTransform: React.Dispatch<React.SetStateAction<Transform>>,
  historySteps: HistoryStep[],
  setHistorySteps: React.Dispatch<React.SetStateAction<HistoryStep[]>>,
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleCapture = () => {
    const step = {
      timestamp: Date.now(),
      cards,
      tracks,
      transform,
    };
    setHistorySteps((prev) => [...prev, step]);
  };

  const restoreStep = (index: number) => {
    if (index >= 0 && index < historySteps.length) {
      const step = historySteps[index];
      if (step.cards) setCards(step.cards);
      if (step.tracks) setTracks(step.tracks);
      if (step.transform) setTransform(step.transform);
    }
  };

  const handleResetRecording = () => {
    const step = {
      timestamp: Date.now(),
      cards,
      tracks,
      transform,
    };
    setHistorySteps([step]);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < historySteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      restoreStep(newIndex);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      restoreStep(newIndex);
    }
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    handleCapture,
    restoreStep,
    handleResetRecording,
    handleNextStep,
    handlePrevStep,
  };
}
