import { useCallback, useRef, useState, useEffect } from "react";
import type { Transform, Point } from "../../types";

export function useZoomPan(
  setTransform: React.Dispatch<React.SetStateAction<Transform>>,
  canvasRef: React.RefObject<HTMLDivElement | null>,
) {
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });

  const isPanningRef = useRef(isPanning);
  const lastPanPointRef = useRef(lastPanPoint);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);
  useEffect(() => {
    lastPanPointRef.current = lastPanPoint;
  }, [lastPanPoint]);

  const handleZoom = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      setTransform((prev) => {
        const newScale = Math.min(Math.max(prev.scale + delta, 0.2), 3);
        if (newScale === prev.scale) return prev;
        const ratio = newScale / prev.scale;
        const x = centerX - (centerX - prev.x) * ratio;
        const y = centerY - (centerY - prev.y) * ratio;
        return { x, y, scale: newScale };
      });
    },
    [setTransform],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (!canvasRef.current) return;
        e.preventDefault();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        handleZoom(
          -e.deltaY * 0.002,
          e.clientX - canvasRect.left,
          e.clientY - canvasRect.top,
        );
      } else {
        setTransform((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [canvasRef, handleZoom, setTransform],
  );

  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    isPanningRef.current = true;
    const startPoint = { x: clientX, y: clientY };
    setLastPanPoint(startPoint);
    lastPanPointRef.current = startPoint;
  }, []);

  const updatePan = useCallback(
    (clientX: number, clientY: number) => {
      if (isPanningRef.current) {
        const lastPanPoint = lastPanPointRef.current;
        const dx = clientX - lastPanPoint.x;
        const dy = clientY - lastPanPoint.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setLastPanPoint({ x: clientX, y: clientY });
        lastPanPointRef.current = { x: clientX, y: clientY };
      }
    },
    [setTransform],
  );

  const stopPan = useCallback(() => {
    setIsPanning(false);
    isPanningRef.current = false;
  }, []);

  return {
    isPanning,
    isPanningRef,
    lastPanPoint,
    lastPanPointRef,
    handleZoom,
    handleWheel,
    startPan,
    updatePan,
    stopPan,
  };
}
