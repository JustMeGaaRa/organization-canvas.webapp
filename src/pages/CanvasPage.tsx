import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Track } from "../components/Track/Track";
import { RoleCard } from "../components/RoleCard/RoleCard";
import { OrgHeader } from "../components/Canvas/OrgHeader";
import { ZoomControls } from "../components/Canvas/ZoomControls";
import { ViewControls } from "../components/Canvas/ViewControls";
import { Toolbar } from "../components/Canvas/Toolbar";
import { Sidebar } from "../components/Sidebar";
import { useCanvasData } from "../hooks/useCanvasData";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import type {
  Role,
  Person,
  Org,
  RoleTemplate,
  Transform,
  TrackData,
} from "../types";

const TRACK_PADDING = 20;

type HistoryStep = {
  timestamp: number;
  cards: Role[];
  tracks: TrackData[];
  transform: Transform;
};

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
  const [historySteps, setHistorySteps] = useState<HistoryStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [viewMode, setViewMode] = useState<"structure" | "chart">("chart");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Canvas Data & Interaction Hooks
  const { cards, setCards, tracks, setTracks, transform, setTransform } =
    useCanvasData(currentOrgId);

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
    handleMouseDown,
    handleWheel,
    handleZoom,
    startDragExternal,
    setSelectedIds,
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

  const toggleCardSize = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, size: c.size === "small" ? "large" : "small" }
          : c,
      ),
    );
  };
  const handleBackup = () => {
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      orgId: currentOrgId,
      orgName: orgName,
      cards: cards,
      tracks: tracks,
      roleTemplates: roleTemplates,
      peopleTemplates: peopleTemplates,
      transform: transform,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTrackNameChange = (id: string, newName: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: newName } : t)),
    );
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.cards || !data.tracks) {
          alert("Invalid backup file: Missing cards or tracks data.");
          return;
        }

        // Restore data
        if (data.orgName) updateOrgName(data.orgName);
        if (data.cards) setCards(data.cards);
        if (data.tracks) setTracks(data.tracks);
        if (data.roleTemplates) setRoleTemplates(data.roleTemplates);
        if (data.peopleTemplates) setPeopleTemplates(data.peopleTemplates);
        if (data.transform) setTransform(data.transform);

        // alert("Organization restored successfully!");
      } catch (err) {
        console.error("Failed to restore backup:", err);
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCapture = () => {
    const step = {
      timestamp: Date.now(),
      cards,
      tracks,
      transform,
    };
    setHistorySteps((prev) => [...prev, step]);
    // Optional: Visual feedback could be added here
  };

  const restoreStep = (index: number) => {
    if (index >= 0 && index < historySteps.length) {
      const step = historySteps[index];
      if (step.cards) setCards(step.cards);
      if (step.tracks) setTracks(step.tracks);
      if (step.transform) setTransform(step.transform);
    }
  };

  const handleToolModeChange = (
    mode: "select" | "pan" | "track" | "record" | "present",
  ) => {
    if (mode === "track") {
      const selectedCards = cards.filter((c) => selectedIds.includes(c.id));
      if (selectedCards.length > 0) {
        // Group Logic
        let minX = Infinity;
        let minY = Infinity;
        let maxRight = -Infinity;
        let maxBottom = -Infinity;

        // Constants used for calculation (Must be consistent with rendering)
        const CARD_WIDTH_LARGE = 256; // w-64
        const CARD_WIDTH_SMALL = 224; // w-56
        const CARD_HEIGHT_LARGE = 256; // h-64
        const CARD_HEIGHT_SMALL = 120; // Approx based on content

        selectedCards.forEach((c) => {
          minX = Math.min(minX, c.x);
          minY = Math.min(minY, c.y);
          maxRight = Math.max(
            maxRight,
            c.x + (c.size === "small" ? CARD_WIDTH_SMALL : CARD_WIDTH_LARGE),
          );
          maxBottom = Math.max(
            maxBottom,
            c.y + (c.size === "small" ? CARD_HEIGHT_SMALL : CARD_HEIGHT_LARGE),
          );
        });
        const newTrack: TrackData = {
          id: `track-${Date.now()}`,
          x: minX - TRACK_PADDING,
          y: minY - TRACK_PADDING,
          width: maxRight - minX + TRACK_PADDING * 2,
          height: maxBottom - minY + TRACK_PADDING * 2,
          containedCardIds: selectedCards.map((c) => c.id),
          name: "Group",
        };

        setTracks((prev) => [...prev, newTrack]);
        setSelectedIds([newTrack.id]);
        setToolMode("select");
      } else {
        alert("Please select cards to create a group.");
        setToolMode("select");
      }
      return;
    }

    if (mode === "present") {
      if (historySteps.length > 0) {
        setCurrentStepIndex(0);
        restoreStep(0); // Start from first step
      }
      setIsSidebarOpen(false); // Close sidebar in present mode
    }

    setToolMode(mode);
  };

  const handleResetRecording = () => {
    setHistorySteps([]);
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <main
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`flex-grow relative bg-slate-100 overflow-hidden outline-none ${
          toolMode === "pan"
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        }`}
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 ${1.5 * transform.scale}px, transparent ${1.5 * transform.scale}px)`,
          backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
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
          />
        )}

        <div
          className={`absolute inset-0 pointer-events-none ${
            isPanning ? "" : "transition-transform duration-75 ease-out"
          }`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div className="relative w-full h-full pointer-events-auto">
            {tracks.map((track) => (
              <Track
                key={track.id}
                trackData={track}
                isDragging={draggingId === track.id && draggingType === "track"}
                isResizing={resizingId === track.id}
                isSelected={selectedIds.includes(track.id)}
                onMouseDown={handleStartDragTrack}
                onResizeStart={handleResizeStart}
                onNameChange={handleTrackNameChange}
                isOverDeleteZone={
                  isOverDeleteZone &&
                  draggingId === track.id &&
                  draggingType === "track"
                }
              />
            ))}
            {cards.map((card) => (
              <RoleCard
                key={card.id}
                roleData={card}
                viewMode={viewMode}
                isDragging={draggingId === card.id && draggingType === "card"}
                isSelected={selectedIds.includes(card.id)}
                isOverDeleteZone={
                  isOverDeleteZone &&
                  draggingId === card.id &&
                  draggingType === "card"
                }
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) =>
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
              />
            ))}
          </div>
        </div>

        {toolMode !== "present" && (
          <ViewControls viewMode={viewMode} setViewMode={setViewMode} />
        )}

        {toolMode !== "present" && (
          <ZoomControls
            scale={transform.scale}
            onZoomIn={() =>
              handleZoom(0.1, window.innerWidth / 2, window.innerHeight / 2)
            }
            onZoomOut={() =>
              handleZoom(-0.1, window.innerWidth / 2, window.innerHeight / 2)
            }
            onReset={() => setTransform({ x: 0, y: 0, scale: 1 })}
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
        />

        {toolMode !== "present" && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`absolute top-6 right-6 p-2 bg-white border border-slate-200 rounded-full shadow-lg hover:bg-slate-50 z-30 transition-all duration-300 ${
              isSidebarOpen
                ? "opacity-0 scale-90 pointer-events-none"
                : "opacity-100 scale-100"
            }`}
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        )}
      </main>

      <Sidebar
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
        onBackup={handleBackup}
        onRestore={handleRestore}
        onRoleDragStart={(e, roleTemplate) => {
          // Create the card
          if (!canvasRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const canvasRect = canvasRef.current.getBoundingClientRect();
          const id = `${Date.now()}`;

          const initialX =
            (rect.left - canvasRect.left - transform.x) / transform.scale;
          const initialY =
            (rect.top - canvasRect.top - transform.y) / transform.scale;

          const newCard: Role = {
            ...roleTemplate,
            id,
            x: initialX,
            y: initialY,
            assignedPerson: undefined,
            status: "unassigned",
            size: "large",
          };

          setCards((prev) => [...prev, newCard]);

          startDragExternal(e, id, "card", initialX, initialY);
        }}
      />
    </div>
  );
};
