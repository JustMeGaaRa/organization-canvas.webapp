import { forwardRef } from "react";
import {
  Trash2,
  MousePointer2,
  Hand,
  Square,
  StopCircle,
  Camera,
  Play,
  SkipBack,
  SkipForward,
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
    },
    ref,
  ) => {
    return (
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          ref={ref}
          className={`flex items-center p-1.5 rounded-2xl shadow-xl transition-all duration-300 ${
            isDragging
              ? isOverDeleteZone
                ? "bg-red-500 scale-110 w-48 justify-center text-white"
                : "bg-slate-900 w-48 justify-center text-white"
              : "bg-white/90 backdrop-blur-sm border border-slate-200/60"
          }`}
        >
          {isDragging ? (
            <div className="flex items-center gap-2">
              <Trash2
                size={20}
                className={isOverDeleteZone ? "animate-bounce" : ""}
              />
              <span className="text-xs font-bold uppercase tracking-widest">
                Delete
              </span>
            </div>
          ) : (
            <ToolbarPrimitive.Group className="px-1">
              {toolMode === "present" ? (
                <>
                  <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {currentStepIndex + 1} / {stepCount}
                    </span>
                  </div>
                  <ToolbarPrimitive.Separator />
                  <ToolbarPrimitive.Item
                    onClick={onPrevStep}
                    disabled={currentStepIndex === 0}
                    variant="nav"
                    icon={<SkipBack size={16} />}
                    label="Prev Step"
                  />
                  <ToolbarPrimitive.Item
                    onClick={onNextStep}
                    disabled={currentStepIndex >= stepCount - 1}
                    variant="nav"
                    icon={<SkipForward size={16} />}
                    label="Next Step"
                  />
                  <ToolbarPrimitive.Separator />
                  <ToolbarPrimitive.Item
                    onClick={() => setToolMode("select")}
                    variant="danger"
                    icon={<StopCircle size={16} />}
                    label="End Presentation"
                  />
                </>
              ) : (
                <>
                  <ToolbarPrimitive.Item
                    onClick={() => setToolMode("select")}
                    isActive={toolMode === "select"}
                    icon={<MousePointer2 size={16} />}
                    label="Cursor"
                  />
                  <ToolbarPrimitive.Item
                    onClick={() => setToolMode("pan")}
                    isActive={toolMode === "pan"}
                    icon={<Hand size={16} />}
                    label="Pan"
                  />
                  <ToolbarPrimitive.Item
                    onClick={() => setToolMode("track")}
                    isActive={toolMode === "track"}
                    icon={<Square size={16} />}
                    label="Track"
                  />
                  <ToolbarPrimitive.Separator />
                  <ToolbarPrimitive.Item
                    onClick={onCapture}
                    icon={<Camera size={16} />}
                    label="Capture"
                  >
                    <span className="absolute -top-3 -right-3 bg-slate-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-100 font-bold">
                      {stepCount}
                    </span>
                  </ToolbarPrimitive.Item>
                  <ToolbarPrimitive.Item
                    onClick={onResetRecording}
                    icon={<Trash2 size={16} />}
                    label="Reset"
                  />
                  <ToolbarPrimitive.Separator />
                  <ToolbarPrimitive.Item
                    onClick={() => setToolMode("present")}
                    icon={<Play size={16} />}
                    label="Present"
                  />
                </>
              )}
            </ToolbarPrimitive.Group>
          )}
        </div>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
