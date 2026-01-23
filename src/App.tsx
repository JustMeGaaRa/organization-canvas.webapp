import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Briefcase,
  Trash2,
  Plus,
  User,
  Search,
  AlertCircle,
  Hand,
  MousePointer2,
  PlusCircle,
  MinusCircle,
  Focus,
  Settings2,
  ArrowLeft,
  Pencil,
  Save,
  ImageIcon,
  Square,
} from "lucide-react";
import { Track } from "./Track";
import { RoleCard } from "./RoleCard";

/**
 * Main App
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("org_currentPage") || "canvas";
  });
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("org_cards");
    return saved ? JSON.parse(saved) : [];
  });
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem("org_tracks");
    return saved ? JSON.parse(saved) : [];
  });

  const [draggingId, setDraggingId] = useState(null);
  const [draggingType, setDraggingType] = useState(null); // 'card' or 'track'
  const [resizingId, setResizingId] = useState(null);
  const [resizingSide, setResizingSide] = useState(null); // 'top', 'bottom', 'left', 'right'

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("org_isSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("org_activeTab") || "roles";
  });
  const [viewMode, setViewMode] = useState("chart");
  const [toolMode, setToolMode] = useState("select");
  const [transform, setTransform] = useState(() => {
    const saved = localStorage.getItem("org_transform");
    return saved ? JSON.parse(saved) : { x: 0, y: 0, scale: 1 };
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [defaultCardSize, setDefaultCardSize] = useState(() => {
    return localStorage.getItem("org_defaultCardSize") || "large";
  });
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State to track library tab specifically
  const [libraryEditorTab, setLibraryEditorTab] = useState(() => {
    return localStorage.getItem("org_libraryEditorTab") || "roles";
  });

  const [roleTemplates, setRoleTemplates] = useState(() => {
    const saved = localStorage.getItem("org_role_templates");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "r1",
            role: "Chief Executive",
            summary:
              "Strategic vision and high-level decision making for the entire organization.",
          },
          {
            id: "r2",
            role: "Engineering Lead",
            summary:
              "Oversees technical implementation, roadmap, and core platform architecture.",
          },
          {
            id: "r3",
            role: "Product Designer",
            summary:
              "Ensures user-centricity through rigorous research and visual consistency.",
          },
        ];
  });

  const [peopleTemplates, setPeopleTemplates] = useState(() => {
    const saved = localStorage.getItem("org_people_templates");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "p1",
            name: "Alex Rivera",
            imageUrl:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
          },
          {
            id: "p2",
            name: "Sarah Chen",
            imageUrl:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
          },
        ];
  });

  const GRID_SIZE = 20;
  const canvasRef = useRef(null);
  const deleteZoneRef = useRef(null);

  const filteredRoles = roleTemplates.filter((r) =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredPeople = peopleTemplates.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const isDuplicate =
    activeTab === "roles"
      ? roleTemplates.some(
          (r) => r.role.toLowerCase() === searchQuery.trim().toLowerCase(),
        )
      : peopleTemplates.some(
          (p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase(),
        );

  const handleZoom = useCallback((delta, centerX, centerY) => {
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale + delta, 0.2), 3);
      if (newScale === prev.scale) return prev;
      const ratio = newScale / prev.scale;
      const x = centerX - (centerX - prev.x) * ratio;
      const y = centerY - (centerY - prev.y) * ratio;
      return { x, y, scale: newScale };
    });
  }, []);

  const toggleCardSize = (cardId) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, size: c.size === "small" ? "large" : "small" }
          : c,
      ),
    );
  };

  const handleStartDragCard = (e, cardId) => {
    if (toolMode !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const card = cards.find((c) => c.id === cardId);
    setDraggingId(cardId);
    setDraggingType("card");
    setOffset({
      x: e.clientX / transform.scale - card.x,
      y: e.clientY / transform.scale - card.y,
    });
  };

  const handleStartDragTrack = (e, trackId) => {
    if (toolMode !== "select" || e.button !== 0) return;
    e.stopPropagation();
    const track = tracks.find((t) => t.id === trackId);
    setDraggingId(trackId);
    setDraggingType("track");
    setOffset({
      x: e.clientX / transform.scale - track.x,
      y: e.clientY / transform.scale - track.y,
    });
  };

  const handleResizeStart = (e, trackId, side) => {
    e.stopPropagation();
    setResizingId(trackId);
    setResizingSide(side);
  };

  const addTrack = () => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const id = `track-${Date.now()}`;
    const centerX = (-transform.x + canvasRect.width / 2) / transform.scale;
    const centerY = (-transform.y + canvasRect.height / 2) / transform.scale;

    setTracks((prev) => [
      ...prev,
      {
        id,
        x: centerX - 200,
        y: centerY - 150,
        width: 400,
        height: 300,
      },
    ]);
    setToolMode("select");
  };

  const handleSidebarDragStart = (e, item, type) => {
    if (type === "role") {
      const rect = e.currentTarget.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const id = Date.now();
      const initialX =
        (rect.left - canvasRect.left - transform.x) / transform.scale;
      const initialY =
        (rect.top - canvasRect.top - transform.y) / transform.scale;
      const newCard = {
        ...item,
        id,
        x: initialX,
        y: initialY,
        assignedPerson: null,
        status: "unassigned",
        size: defaultCardSize,
      };
      setCards((prev) => [...prev, newCard]);
      setDraggingId(id);
      setDraggingType("card");
      setOffset({
        x: e.clientX / transform.scale - initialX,
        y: e.clientY / transform.scale - initialY,
      });
    } else {
      e.dataTransfer.setData("person", JSON.stringify(item));
    }
  };

  const handleMouseDown = (e) => {
    if (currentPage !== "canvas") return;
    if (toolMode === "pan" || e.button === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (currentPage !== "canvas") return;

    // Handle Panning
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Handle Resizing
    if (resizingId) {
      const mouseX = e.clientX / transform.scale;
      const mouseY = e.clientY / transform.scale;
      setTracks((prev) =>
        prev.map((t) => {
          if (t.id !== resizingId) return t;
          let newT = { ...t };
          const gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
          const gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
          if (resizingSide === "right") newT.width = Math.max(100, gridX - t.x);
          if (resizingSide === "left") {
            const newWidth = t.width + (t.x - gridX);
            if (newWidth >= 100) {
              newT.x = gridX;
              newT.width = newWidth;
            }
          }
          if (resizingSide === "bottom")
            newT.height = Math.max(100, gridY - t.y);
          if (resizingSide === "top") {
            const newHeight = t.height + (t.y - gridY);
            if (newHeight >= 100) {
              newT.y = gridY;
              newT.height = newHeight;
            }
          }
          return newT;
        }),
      );
      return;
    }
    if (!draggingId) return;
    if (deleteZoneRef.current) {
      const dzRect = deleteZoneRef.current.getBoundingClientRect();
      setIsOverDeleteZone(
        e.clientX >= dzRect.left &&
          e.clientX <= dzRect.right &&
          e.clientY >= dzRect.top &&
          e.clientY <= dzRect.bottom,
      );
    }
    const newX =
      Math.round((e.clientX / transform.scale - offset.x) / GRID_SIZE) *
      GRID_SIZE;
    const newY =
      Math.round((e.clientY / transform.scale - offset.y) / GRID_SIZE) *
      GRID_SIZE;
    if (draggingType === "card") {
      setCards((prev) =>
        prev.map((c) => (c.id === draggingId ? { ...c, x: newX, y: newY } : c)),
      );
    } else {
      setTracks((prev) =>
        prev.map((t) => (t.id === draggingId ? { ...t, x: newX, y: newY } : t)),
      );
    }
  };

  const handleMouseUp = () => {
    if (draggingId && isOverDeleteZone) {
      if (draggingType === "card")
        setCards((prev) => prev.filter((c) => c.id !== draggingId));
      else setTracks((prev) => prev.filter((t) => t.id !== draggingId));
    }
    setDraggingId(null);
    setDraggingType(null);
    setResizingId(null);
    setResizingSide(null);
    setIsPanning(false);
    setIsOverDeleteZone(false);
  };

  const handleWheel = (e) => {
    if (currentPage !== "canvas") return;
    if (e.ctrlKey || e.metaKey) {
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
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    draggingId,
    draggingType,
    resizingId,
    resizingSide,
    isPanning,
    isOverDeleteZone,
    offset,
    transform,
    toolMode,
    currentPage,
  ]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("org_currentPage", currentPage);
    localStorage.setItem("org_cards", JSON.stringify(cards));
    localStorage.setItem("org_tracks", JSON.stringify(tracks));
    localStorage.setItem("org_isSidebarOpen", JSON.stringify(isSidebarOpen));
    localStorage.setItem("org_activeTab", activeTab);
    localStorage.setItem("org_transform", JSON.stringify(transform));
    localStorage.setItem("org_defaultCardSize", defaultCardSize);
    localStorage.setItem("org_role_templates", JSON.stringify(roleTemplates));
    localStorage.setItem(
      "org_people_templates",
      JSON.stringify(peopleTemplates),
    );
    localStorage.setItem("org_libraryEditorTab", libraryEditorTab);
  }, [
    currentPage,
    cards,
    tracks,
    isSidebarOpen,
    activeTab,
    transform,
    defaultCardSize,
    roleTemplates,
    peopleTemplates,
    libraryEditorTab,
  ]);

  /**
   * Library Management Page Component
   */
  const LibraryEditor = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleEditStart = (item, type) => {
      setEditingId(item.id);
      if (type === "role") {
        setEditForm({ role: item.role, summary: item.summary });
      } else {
        setEditForm({ name: item.name, imageUrl: item.imageUrl });
      }
    };

    const handleSaveEdit = (id, type) => {
      if (type === "role") {
        setRoleTemplates((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...editForm } : r)),
        );
      } else {
        setPeopleTemplates((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)),
        );
      }
      setEditingId(null);
    };

    const handleAddNew = () => {
      const id = `new-${Date.now()}`;
      if (libraryEditorTab === "roles") {
        const newRole = {
          id,
          role: "New Role Name",
          summary: "Description of the role goes here.",
        };
        setRoleTemplates([newRole, ...roleTemplates]);
        handleEditStart(newRole, "role");
      } else {
        const newPerson = {
          id,
          name: "New Full Name",
          imageUrl: "https://i.pravatar.cc/150?u=" + id,
        };
        setPeopleTemplates([newPerson, ...peopleTemplates]);
        handleEditStart(newPerson, "person");
      }
    };

    return (
      <div className="flex-grow flex flex-col h-full bg-white animate-in fade-in duration-300">
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("canvas")}
              className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Library Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Configure roles and people available for your organizational
                sandbox
              </p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all font-bold text-xs"
          >
            <Plus size={16} />
            {libraryEditorTab === "roles" ? "Add Role" : "Add Person"}
          </button>
        </header>

        <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-8 overflow-hidden">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setLibraryEditorTab("roles")}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${libraryEditorTab === "roles" ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
            >
              <Briefcase size={24} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Global Roles
              </span>
            </button>
            <button
              onClick={() => setLibraryEditorTab("people")}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${libraryEditorTab === "people" ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
            >
              <Users size={24} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Global People
              </span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-4 space-y-4 pb-12">
            {libraryEditorTab === "roles" ? (
              <div className="space-y-4">
                {roleTemplates.map((role) => (
                  <div
                    key={role.id}
                    className={`p-5 bg-white border rounded-2xl transition-all ${editingId === role.id ? "border-blue-400 ring-4 ring-blue-50 shadow-lg" : "border-slate-100 shadow-sm hover:shadow-md group"}`}
                  >
                    {editingId === role.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Role Name
                          </label>
                          <input
                            type="text"
                            value={editForm.role}
                            onChange={(e) =>
                              setEditForm({ ...editForm, role: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Role Summary
                          </label>
                          <textarea
                            value={editForm.summary}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                summary: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:bg-white outline-none resize-none"
                            placeholder="Briefly describe the responsibilities..."
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(role.id, "role")}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                          >
                            <Save size={14} /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">
                              {role.role}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {role.summary}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditStart(role, "role")}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setRoleTemplates(
                                roleTemplates.filter((r) => r.id !== role.id),
                              )
                            }
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {peopleTemplates.map((person) => (
                  <div
                    key={person.id}
                    className={`p-5 bg-white border rounded-2xl transition-all ${editingId === person.id ? "border-blue-400 ring-4 ring-blue-50 shadow-lg" : "border-slate-100 shadow-sm hover:shadow-md group"}`}
                  >
                    {editingId === person.id ? (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={editForm.imageUrl}
                              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                              alt="Preview"
                            />
                          </div>
                          <div className="flex-grow space-y-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                                placeholder="e.g. John Doe"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                Avatar URL
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={editForm.imageUrl}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      imageUrl: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:bg-white outline-none font-mono"
                                  placeholder="https://images.unsplash.com/..."
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                  <ImageIcon size={14} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(person.id, "person")}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                          >
                            <Save size={14} /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={person.imageUrl}
                            className="w-12 h-12 rounded-full shadow-sm object-cover"
                            alt=""
                          />
                          <div>
                            <h4 className="font-bold text-slate-800">
                              {person.name}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Resource Profile
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditStart(person, "person")}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setPeopleTemplates(
                                peopleTemplates.filter(
                                  (p) => p.id !== person.id,
                                ),
                              )
                            }
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {currentPage === "canvas" ? (
        <>
          <main
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            className={`flex-grow relative bg-slate-100 overflow-hidden outline-none ${toolMode === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
          >
            <div
              className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: "0 0",
                backgroundImage:
                  "radial-gradient(#cbd5e1 1.5px, transparent 1.5px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                {tracks.map((track) => (
                  <Track
                    key={track.id}
                    trackData={track}
                    isDragging={
                      draggingId === track.id && draggingType === "track"
                    }
                    isResizing={resizingId === track.id}
                    onMouseDown={handleStartDragTrack}
                    onResizeStart={handleResizeStart}
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
                    isDragging={
                      draggingId === card.id && draggingType === "card"
                    }
                    isOverDeleteZone={
                      isOverDeleteZone &&
                      draggingId === card.id &&
                      draggingType === "card"
                    }
                    onMouseDown={(e) => handleStartDragCard(e, card.id)}
                    onPersonDrop={(rid, p) =>
                      setCards((prev) =>
                        prev.map((c) =>
                          c.id === rid
                            ? { ...c, assignedPerson: p, status: "suggested" }
                            : c,
                        ),
                      )
                    }
                    onApprove={(rid) =>
                      setCards((prev) =>
                        prev.map((c) =>
                          c.id === rid ? { ...c, status: "assigned" } : c,
                        ),
                      )
                    }
                    onClear={(rid) =>
                      setCards((prev) =>
                        prev.map((c) =>
                          c.id === rid
                            ? {
                                ...c,
                                status: "unassigned",
                                assignedPerson: null,
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

            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
              <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-lg">
                <button
                  onClick={() => setViewMode("structure")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${viewMode === "structure" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  <Briefcase size={14} /> <span>Structure</span>
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${viewMode === "chart" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  <User size={14} /> <span>Chart</span>
                </button>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 z-40">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center p-1 gap-1">
                <button
                  onClick={() =>
                    handleZoom(
                      -0.1,
                      window.innerWidth / 2,
                      window.innerHeight / 2,
                    )
                  }
                  className="p-2 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <MinusCircle size={20} />
                </button>
                <div className="px-2 min-w-[50px] text-center border-x border-slate-100 cursor-default">
                  <span className="text-[11px] font-bold text-slate-600">
                    {Math.round(transform.scale * 100)}%
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleZoom(
                      0.1,
                      window.innerWidth / 2,
                      window.innerHeight / 2,
                    )
                  }
                  className="p-2 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <PlusCircle size={20} />
                </button>
                <button
                  onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
                  className="p-2 ml-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                  title="Reset"
                >
                  <Focus size={18} />
                </button>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
              <div
                ref={deleteZoneRef}
                className={`flex items-center px-2 py-2 rounded-2xl shadow-2xl transition-all duration-300 ${draggingId ? (isOverDeleteZone ? "bg-red-500 scale-110 w-48 justify-center text-white" : "bg-slate-900 w-48 justify-center text-white") : "bg-white border border-slate-200"}`}
              >
                {draggingId ? (
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
                  <div className="flex items-center gap-2 px-1">
                    <button
                      onClick={() => setToolMode("select")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${toolMode === "select" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      <MousePointer2 size={16} /> <span>Cursor</span>
                    </button>
                    <button
                      onClick={() => setToolMode("pan")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${toolMode === "pan" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      <Hand size={16} /> <span>Pan</span>
                    </button>
                    <div className="w-px h-6 bg-slate-100 mx-1" />
                    <button
                      onClick={addTrack}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    >
                      <Square size={16} /> <span>Track</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-6 right-6 p-2 bg-white border border-slate-200 rounded-full shadow-lg hover:bg-slate-50 z-30"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
            )}
          </main>

          <aside
            className={`${isSidebarOpen ? "w-80" : "w-0"} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-xl overflow-hidden`}
          >
            {isSidebarOpen && (
              <div className="w-80 flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    Library
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 hover:bg-slate-100 rounded-md"
                  >
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                </div>

                <div className="px-6 py-4">
                  <button
                    onClick={() => setCurrentPage("library-editor")}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings2 size={16} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Manage Assets
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

                <div className="flex px-6 pt-2 gap-4 border-b border-slate-50">
                  <button
                    onClick={() => setActiveTab("roles")}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "roles" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
                  >
                    <Briefcase size={14} /> Roles
                  </button>
                  <button
                    onClick={() => setActiveTab("people")}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "people" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
                  >
                    <Users size={14} /> People
                  </button>
                </div>
                <div className="px-6 py-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!searchQuery.trim() || isDuplicate) return;
                      if (activeTab === "roles")
                        setRoleTemplates([
                          {
                            id: `r-${Date.now()}`,
                            role: searchQuery.trim(),
                            summary: "Custom role added to library.",
                          },
                          ...roleTemplates,
                        ]);
                      else
                        setPeopleTemplates([
                          {
                            id: `p-${Date.now()}`,
                            name: searchQuery.trim(),
                            imageUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
                          },
                          ...peopleTemplates,
                        ]);
                      setSearchQuery("");
                    }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeTab}...`}
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white outline-none transition-all ${isDuplicate ? "border-amber-200" : "border-slate-100 focus:border-blue-300"}`}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={14} />
                    </div>
                    {searchQuery && !isDuplicate && (
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                    {isDuplicate && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </form>
                </div>
                <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
                  {activeTab === "roles"
                    ? filteredRoles.map((r) => (
                        <div
                          key={r.id}
                          onMouseDown={(e) =>
                            handleSidebarDragStart(e, r, "role")
                          }
                          className="group relative p-4 border border-slate-100 bg-slate-50 rounded-xl cursor-grab hover:border-blue-200 hover:bg-blue-50 transition-all"
                          style={{
                            userSelect: "none",
                          }}
                        >
                          <p className="text-xs font-bold text-slate-700">
                            {r.role}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                            Role Template
                          </p>
                        </div>
                      ))
                    : filteredPeople.map((p) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={(e) =>
                            handleSidebarDragStart(e, p, "person")
                          }
                          className="group relative p-3 border border-slate-100 bg-white rounded-xl cursor-grab hover:border-green-200 hover:bg-green-50 flex items-center gap-3 transition-all"
                          style={{
                            userSelect: "none",
                          }}
                        >
                          <img
                            src={p.imageUrl}
                            className="w-8 h-8 rounded-full shadow-sm"
                            alt=""
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {p.name}
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
                              Person
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}
          </aside>
        </>
      ) : (
        <LibraryEditor />
      )}
    </div>
  );
}
