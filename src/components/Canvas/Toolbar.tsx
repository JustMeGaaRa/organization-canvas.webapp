import { forwardRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Trash2,
  MousePointer2,
  Hand,
  Square,
  Camera,
  Play,
  SkipBack,
  SkipForward,
  X,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { Toolbar as ToolbarPrimitive } from "../ui/Toolbar";

interface ToolbarProps {
  toolMode: "select" | "pan" | "track" | "record" | "present";
  setToolMode: (
    mode: "select" | "pan" | "track" | "record" | "present",
  ) => void;
  onCapture?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  stepCount?: number;
  currentStepIndex?: number;
  onResetRecording?: () => void;
  isDragging: boolean;
  isOverDeleteZone: boolean;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onClearSelection?: () => void;
  onCreateGroup?: () => void;
  onDeleteSelected?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;

  // Layout parameters
  utilityPosition?: "bottom" | "right";
  utilityOrientation?: "horizontal" | "vertical";
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      toolMode,
      setToolMode,
      isDragging,
      isOverDeleteZone,
      onCapture,
      onNextStep,
      onPrevStep,
      stepCount = 0,
      currentStepIndex = 0,
      onResetRecording,
      isSelectionMode = false,
      selectedIds = [],
      onClearSelection,
      onCreateGroup,
      onDeleteSelected,
      isSidebarOpen = false,
      onToggleSidebar,
      utilityPosition = "bottom",
      utilityOrientation = "horizontal",
    },
    ref,
  ) => {
    // 1. Contextual Toolbar (Dragging, Presenting, Selecting)
    if (isDragging || toolMode === "present" || isSelectionMode) {
      return (
        <div
          className="absolute z-40 bottom-safe-8 left-1/2 -translate-x-1/2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ToolbarPrimitive.Root ref={ref} orientation="horizontal">
            {isDragging ? (
              <ToolbarPrimitive.Group
                orientation="horizontal"
                className={
                  isOverDeleteZone
                    ? "!bg-red-500 !border-red-500"
                    : "!border-red-200"
                }
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <Trash2
                    size={16}
                    className={
                      isOverDeleteZone
                        ? "text-white animate-bounce"
                        : "text-red-400"
                    }
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                      isOverDeleteZone ? "text-white" : "text-red-400"
                    }`}
                  >
                    {isOverDeleteZone
                      ? "Release to delete"
                      : "Drop here to delete"}
                  </span>
                </div>
              </ToolbarPrimitive.Group>
            ) : toolMode === "present" ? (
              <ToolbarPrimitive.Group orientation="horizontal" className="px-1">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 text-[11px] font-bold tabular-nums">
                    {currentStepIndex + 1} / {stepCount}
                  </span>
                </div>
                <ToolbarPrimitive.Separator orientation="horizontal" />
                <ToolbarPrimitive.Item
                  onClick={onPrevStep}
                  disabled={currentStepIndex === 0}
                  variant="nav"
                  icon={<SkipBack size={16} />}
                  title="Prev"
                />
                <ToolbarPrimitive.Item
                  onClick={onNextStep}
                  disabled={currentStepIndex >= stepCount - 1}
                  variant="nav"
                  icon={<SkipForward size={16} />}
                  title="Next"
                />
                <ToolbarPrimitive.Separator orientation="horizontal" />
                <ToolbarPrimitive.Item
                  onClick={() => setToolMode("select")}
                  icon={<X size={16} />}
                  title="End presentation"
                />
              </ToolbarPrimitive.Group>
            ) : (
              <ToolbarPrimitive.Group orientation="horizontal" className="px-1">
                <div className="flex items-center px-3 text-sm font-medium text-slate-600 whitespace-nowrap gap-2">
                  {selectedIds.length} cards selected
                </div>
                <ToolbarPrimitive.Separator orientation="horizontal" />
                <ToolbarPrimitive.Item
                  onClick={onCreateGroup}
                  icon={<Square size={16} />}
                  title="Group"
                />
                <ToolbarPrimitive.Item
                  onClick={onDeleteSelected}
                  icon={<Trash2 size={16} />}
                  title="Delete"
                  variant="danger"
                />
                <ToolbarPrimitive.Separator orientation="horizontal" />
                <ToolbarPrimitive.Item
                  onClick={onClearSelection}
                  icon={<X size={16} />}
                  title="Clear selection"
                />
              </ToolbarPrimitive.Group>
            )}
          </ToolbarPrimitive.Root>
        </div>
      );
    }

    // Common groups elements
    const utilityGroup = (
      <ToolbarPrimitive.Root orientation={utilityOrientation}>
        <ToolbarPrimitive.Group
          orientation={utilityOrientation}
          className="px-1"
        >
          <ToolbarPrimitive.Item
            onClick={() => setToolMode("select")}
            isActive={toolMode === "select"}
            icon={<MousePointer2 size={16} />}
            title="Cursor"
          />
          <ToolbarPrimitive.Item
            onClick={() => setToolMode("pan")}
            isActive={toolMode === "pan"}
            icon={<Hand size={16} />}
            title="Pan"
          />
          <ToolbarPrimitive.Separator orientation={utilityOrientation} />
          <ToolbarPrimitive.Item
            onClick={onToggleSidebar}
            isActive={isSidebarOpen}
            icon={<BookOpen size={16} />}
            title="Library"
          />
        </ToolbarPrimitive.Group>
      </ToolbarPrimitive.Root>
    );

    const actionGroup = (
      <ToolbarPrimitive.Root ref={ref} orientation="horizontal">
        <ToolbarPrimitive.Group orientation="horizontal" className="px-1">
          <div
            className="flex items-center justify-center min-w-[32px] px-2 py-1 mx-1 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100 tabular-nums cursor-default whitespace-nowrap"
            title={`${stepCount} steps recorded`}
          >
            {stepCount}
          </div>
          <ToolbarPrimitive.Item
            onClick={onCapture}
            icon={<Camera size={16} />}
            title="Capture"
          />
          <ToolbarPrimitive.Item
            onClick={onResetRecording}
            icon={<RotateCcw size={16} />}
            title="Reset"
          />
          <ToolbarPrimitive.Separator orientation="horizontal" />
          <ToolbarPrimitive.Item
            onClick={() => setToolMode("present")}
            icon={<Play size={16} />}
            title="Present"
          />
        </ToolbarPrimitive.Group>
      </ToolbarPrimitive.Root>
    );

    // 2. Normal Toolbars (Layout dependent)
    const rightVariants: Variants = {
      hidden: { opacity: 0, y: "calc(-50% + 50px)" },
      visible: {
        opacity: 1,
        y: "-50%",
        transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.1 },
      },
      exit: {
        opacity: 0,
        y: "calc(-50% + 50px)",
        transition: { duration: 0.2 },
      },
    };

    const bottomVariants: Variants = {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.1 },
      },
      exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
    };

    return (
      <>
        {/* Action on the Bottom - Always present */}
        <div
          className="absolute z-40 bottom-safe-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {actionGroup}

          <AnimatePresence mode="wait">
            {utilityPosition === "bottom" && (
              <motion.div
                key="utility-bottom"
                variants={bottomVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {utilityGroup}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Utility on the Right */}
        <AnimatePresence mode="wait">
          {utilityPosition === "right" && (
            <motion.div
              key="utility-right"
              className="absolute z-40 right-8 top-1/2" // y: -50% handled by variants
              variants={rightVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {utilityGroup}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);

Toolbar.displayName = "Toolbar";
