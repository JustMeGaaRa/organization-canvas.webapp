import { useState, useRef, useEffect, useCallback } from "react";

export function useSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelectionModeRef = useRef(isSelectionMode);
  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    isSelectionModeRef.current = isSelectionMode;
  }, [isSelectionMode]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, []);

  return {
    isSelectionMode,
    setIsSelectionMode,
    isSelectionModeRef,
    selectedIds,
    setSelectedIds,
    selectedIdsRef,
    toggleSelection,
    clearSelection,
  };
}
