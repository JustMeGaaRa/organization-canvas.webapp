import { useRef, useState, useLayoutEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Track } from "../components/Track/Track";
import { RoleCard } from "../components/RoleCard/RoleCard";
import { OrgHeader } from "../components/Canvas/OrgHeader";
import { ZoomControls } from "../components/Canvas/ZoomControls";
import { ViewControls } from "../components/Canvas/ViewControls";
import { Toolbar } from "../components/Canvas/Toolbar";
import { LibraryPanel } from "../components/Sidebar";
import { useCanvasData } from "../hooks/useCanvasData";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import { useBackupRestore } from "../hooks/useBackupRestore";
import { useGroupLogic } from "../hooks/useGroupLogic";
import { LibraryDragGhost } from "../components/Canvas/LibraryDragGhost";
import { useLibraryDrag } from "../hooks/useLibraryDrag";
import { useCanvasHistory } from "../hooks/useCanvasHistory";
import { useFitToScreen } from "../hooks/useFitToScreen";
import type { Person, Org, RoleTemplate } from "../types";
import { GRID_SIZE } from "../constants";

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(orientation: landscape)").matches
      : false,
  );

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isLandscape;
}

interface CanvasPageProps {
  orgs: Org[];
  currentOrgId: string;
  orgName: string;
  updateOrgName: (name: string) => void;
  switchOrg: (id: string) => void;
  deleteOrg: (e: React.MouseEvent, id: string) => void;
  createNewOrg: () => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  setRoleTemplates: (roles: RoleTemplate[]) => void;
  setPeopleTemplates: (people: Person[]) => void;
  onNavigateToLibrary: () => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
}

export const CanvasPage = ({
  orgs,
  currentOrgId,
  orgName,
  updateOrgName,
  switchOrg,
  deleteOrg,
  createNewOrg,
  roleTemplates,
  peopleTemplates,
  setRoleTemplates,
  setPeopleTemplates,
  onNavigateToLibrary,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
}: CanvasPageProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const [toolMode, setToolMode] = useState<
    "select" | "pan" | "track" | "record" | "present"
  >("select");

  const [viewMode, setViewMode] = useState<"structure" | "chart">("structure");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLandscape = useIsLandscape();

  // Canvas Data & Interaction Hooks
  const {
    cards,
    setCards,
    tracks,
    setTracks,
    transform,
    setTransform,
    historySteps,
    setHistorySteps,
  } = useCanvasData(currentOrgId);

  const { libraryDrag, setLibraryDrag } = useLibraryDrag(
    setCards,
    transform,
    canvasRef,
  );

  const {
    currentStepIndex,
    setCurrentStepIndex,
    handleCapture,
    restoreStep,
    handleResetRecording,
    handleNextStep,
    handlePrevStep,
  } = useCanvasHistory(
    cards,
    tracks,
    transform,
    setCards,
    setTracks,
    setTransform,
    historySteps,
    setHistorySteps,
  );

  const { handleFitToScreen } = useFitToScreen(
    canvasRef,
    cards,
    tracks,
    setTransform,
  );

  const {
    draggingId,
    draggingType,
    resizingId,
    isPanning,
    isOverDeleteZone,
    selectedIds,
    handleStartDragCard,
    handleStartDragTrack,
    handleResizeStart,
    handlePointerDown,
    handleWheel,
    handleZoom,
    setSelectedIds,
    isSelectionMode,
    setIsSelectionMode,
  } = useCanvasInteraction(
    transform,
    setTransform,
    cards,
    setCards,
    tracks,
    setTracks,
    toolMode,
    canvasRef,
    deleteZoneRef,
  );

  const { handleBackup, handleRestore } = useBackupRestore({
    currentOrgId,
    orgName,
    cards,
    tracks,
    roleTemplates,
    peopleTemplates,
    transform,
    historySteps,
    setCards,
    setTracks,
    setRoleTemplates,
    setPeopleTemplates,
    setTransform,
    setHistorySteps,
    updateOrgName,
  });

  const { createGroup } = useGroupLogic({
    cards,
    selectedIds,
    setTracks,
    setSelectedIds,
    setToolMode,
  });

  const toggleCardSize = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, size: c.size === "small" ? "large" : "small" }
          : c,
      ),
    );
  };

  const handleTrackNameChange = (id: string, newName: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t)),
    );
  };

  const handleToolModeChange = (
    mode: "select" | "pan" | "track" | "record" | "present",
  ) => {
    if (mode === "track") {
      createGroup();
      return;
    }

    if (mode === "present") {
      if (historySteps.length > 0) {
        setCurrentStepIndex(0);
        restoreStep(0);
      }
      setIsSidebarOpen(false);
    } else if (toolMode === "present") {
      if (historySteps.length > 0) {
        const lastIndex = historySteps.length - 1;
        restoreStep(lastIndex);
        setCurrentStepIndex(lastIndex);
      }
    }

    setToolMode(mode);
  };

  const handleUngroupTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    const isSelected = selectedIds.includes(trackId);
    if (isSelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== trackId));
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans overflow-hidden relative">
      <main
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        className={`flex-grow relative bg-slate-100 overflow-hidden outline-none ${
          toolMode === "pan"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        }`}
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 ${1.5 * transform.scale}px, transparent ${1.5 * transform.scale}px)`,
          backgroundSize: `${GRID_SIZE * transform.scale}px ${GRID_SIZE * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          touchAction: "none",
        }}
      >
        {toolMode !== "present" && (
          <OrgHeader
            orgName={orgName}
            updateOrgName={updateOrgName}
            orgs={orgs}
            currentOrgId={currentOrgId}
            switchOrg={switchOrg}
            deleteOrg={deleteOrg}
            createNewOrg={createNewOrg}
            onBackup={handleBackup}
            onRestore={handleRestore}
          />
        )}

        <div
          className={`absolute inset-0 pointer-events-none ${
            isPanning
              ? ""
              : toolMode === "present"
                ? "transition-transform duration-500 ease-in-out"
                : "transition-transform duration-75 ease-out"
          }`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div className="relative w-full h-full pointer-events-auto">
            <AnimatePresence>
              {tracks.map((track) => (
                <Track
                  key={track.id}
                  trackData={track}
                  isDragging={
                    draggingId === track.id && draggingType === "track"
                  }
                  isResizing={resizingId === track.id}
                  isSelected={selectedIds.includes(track.id)}
                  onPointerDown={handleStartDragTrack}
                  onResizeStart={handleResizeStart}
                  onNameChange={handleTrackNameChange}
                  onUngroup={handleUngroupTrack}
                  isDanger={
                    isOverDeleteZone &&
                    draggingId === track.id &&
                    draggingType === "track"
                  }
                  animate={toolMode === "present"}
                />
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {cards.map((card) => (
                <RoleCard
                  key={card.id}
                  roleData={card}
                  variant={viewMode === "chart" ? "detailed" : "simple"}
                  isDragging={draggingId === card.id && draggingType === "card"}
                  isSelected={selectedIds.includes(card.id)}
                  isDanger={
                    isOverDeleteZone &&
                    draggingId === card.id &&
                    draggingType === "card"
                  }
                  isPersonTouchDragOver={
                    libraryDrag?.item.type === "person" &&
                    libraryDrag.overCardId === card.id
                  }
                  onPointerDown={(e: React.PointerEvent<HTMLDivElement>) =>
                    handleStartDragCard(e, card.id)
                  }
                  onPersonDrop={(
                    rid: string,
                    p: { id: string; name: string; imageUrl: string },
                  ) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === rid
                          ? { ...c, assignedPerson: p, status: "suggested" }
                          : c,
                      ),
                    )
                  }
                  onApprove={(rid: string) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === rid ? { ...c, status: "assigned" } : c,
                      ),
                    )
                  }
                  onClear={(rid: string) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.id === rid
                          ? {
                              ...c,
                              status: "unassigned",
                              assignedPerson: undefined,
                            }
                          : c,
                      ),
                    )
                  }
                  onToggleSize={toggleCardSize}
                  animate={toolMode === "present"}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {toolMode !== "present" && (
          <ViewControls viewMode={viewMode} setViewMode={setViewMode} />
        )}

        {toolMode !== "present" && (
          <ZoomControls
            onZoomIn={() =>
              handleZoom(0.1, window.innerWidth / 2, window.innerHeight / 2)
            }
            onZoomOut={() =>
              handleZoom(-0.1, window.innerWidth / 2, window.innerHeight / 2)
            }
            onReset={() => setTransform({ x: 0, y: 0, scale: 1 })}
            onFitToScreen={handleFitToScreen}
          />
        )}

        <Toolbar
          ref={deleteZoneRef}
          toolMode={toolMode}
          setToolMode={handleToolModeChange}
          isDragging={!!draggingId}
          isOverDeleteZone={isOverDeleteZone}
          onCapture={handleCapture}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          stepCount={historySteps.length}
          currentStepIndex={currentStepIndex}
          onResetRecording={handleResetRecording}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onCreateGroup={() => {
            createGroup();
            setIsSelectionMode(false);
            setSelectedIds([]);
          }}
          onDeleteSelected={() => {
            if (selectedIds.length > 0) {
              setCards((prev) =>
                prev.filter((c) => !selectedIds.includes(c.id)),
              );
              setTracks((prev) =>
                prev.filter((t) => !selectedIds.includes(t.id)),
              );
              setSelectedIds([]);
              setIsSelectionMode(false);
            }
          }}
          onClearSelection={() => {
            setIsSelectionMode(false);
            setSelectedIds([]);
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          utilityPosition={isLandscape ? "right" : "bottom"}
          utilityOrientation={isLandscape ? "vertical" : "horizontal"}
        />
      </main>

      {/* Unified Library Drag Ghost */}
      <LibraryDragGhost libraryDrag={libraryDrag} />

      <LibraryPanel
        isOpen={isSidebarOpen && toolMode !== "present"}
        onToggle={setIsSidebarOpen}
        onNavigateToLibrary={onNavigateToLibrary}
        roleTemplates={roleTemplates}
        peopleTemplates={peopleTemplates}
        onAddRoleTemplate={(name) => {
          setRoleTemplates([
            {
              id: `r-${Date.now()}`,
              role: name,
              summary: "Custom role added to library.",
            },
            ...roleTemplates,
          ]);
        }}
        onAddPersonTemplate={(name) => {
          setPeopleTemplates([
            {
              id: `p-${Date.now()}`,
              name: name,
              imageUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            },
            ...peopleTemplates,
          ]);
        }}
        onDeleteRoleTemplate={onDeleteRoleTemplate}
        onDeletePersonTemplate={onDeletePersonTemplate}
        onLibraryDragStart={(e, item) => {
          setLibraryDrag({
            item,
            x: e.clientX,
            y: e.clientY,
            pointerId: e.pointerId,
            overCardId: null,
          });
        }}
        position={isLandscape ? "right" : "bottom"}
      />
    </div>
  );
};
