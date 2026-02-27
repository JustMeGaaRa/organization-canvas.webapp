import { Minus, Plus, Maximize2 } from "lucide-react";
import { Toolbar as ToolbarPrimitive } from "../ui/Toolbar";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
}

export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onFitToScreen,
}: ZoomControlsProps) => {
  return (
    <div
      className="absolute bottom-safe-8 left-safe-8 z-40 [@media(hover:none)]:hidden"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ToolbarPrimitive.Root orientation="horizontal">
        <ToolbarPrimitive.Group orientation="horizontal" className="px-1">
          <ToolbarPrimitive.Item
            onClick={onZoomOut}
            icon={<Minus size={16} />}
            title="Zoom out"
          />
          <ToolbarPrimitive.Item
            onClick={onZoomIn}
            icon={<Plus size={16} />}
            title="Zoom in"
          />

          <ToolbarPrimitive.Separator orientation="horizontal" />

          <ToolbarPrimitive.Item
            onClick={onFitToScreen}
            icon={<Maximize2 size={16} />}
            title="Fit to screen"
          />
          {/* <ToolbarPrimitive.Item
            onClick={onReset}
            icon={<Focus size={16} />}
            title="Reset zoom (100%)"
          /> */}
        </ToolbarPrimitive.Group>
      </ToolbarPrimitive.Root>
    </div>
  );
};
