import { Undo2, Redo2 } from "lucide-react";
import { Toolbar as ToolbarPrimitive } from "../ui/Toolbar";

interface UndoRedoToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const UndoRedoToolbar = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: UndoRedoToolbarProps) => {
  return (
    <div
      className="absolute z-40 bottom-8 right-8"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ToolbarPrimitive.Root orientation="horizontal">
        <ToolbarPrimitive.Group orientation="horizontal" className="px-1 shadow-lg bg-white/95">
          <ToolbarPrimitive.Item
            onClick={onUndo}
            disabled={!canUndo}
            icon={<Undo2 size={18} />}
            title="Undo (Ctrl+Z)"
            className={`${!canUndo ? "opacity-40" : ""}`}
          />
          <ToolbarPrimitive.Separator orientation="horizontal" />
          <ToolbarPrimitive.Item
            onClick={onRedo}
            disabled={!canRedo}
            icon={<Redo2 size={18} />}
            title="Redo (Ctrl+Y)"
            className={`${!canRedo ? "opacity-40" : ""}`}
          />
        </ToolbarPrimitive.Group>
      </ToolbarPrimitive.Root>
    </div>
  );
};
