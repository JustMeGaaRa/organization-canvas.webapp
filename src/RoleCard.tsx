import { useState, useRef, useEffect, type FC } from "react";
import {
  Briefcase,
  Trash2,
  MoreHorizontal,
  Circle,
  Clock,
  CheckCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";

/**
 * RoleCard Component
 */
export const RoleCard: FC<{
  roleData: {
    id: string;
    role: string;
    summary: string;
    assignedPerson?: { id: string; name: string; imageUrl: string };
    status?: "unassigned" | "suggested" | "assigned";
    size?: "small" | "large";
    x: number;
    y: number;
  };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPersonDrop: (
    roleId: string,
    personData: { id: string; name: string; imageUrl: string },
  ) => void;
  onApprove: (roleId: string) => void;
  onClear: (roleId: string) => void;
  onToggleSize: (roleId: string) => void;
  isOverDeleteZone: boolean;
  viewMode: "chart" | "list";
}> = ({
  roleData,
  isDragging,
  onMouseDown,
  onPersonDrop,
  onApprove,
  onClear,
  onToggleSize,
  isOverDeleteZone,
  viewMode,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    role,
    summary,
    assignedPerson,
    status = "unassigned",
    size = "large",
    x,
    y,
  } = roleData;
  const isChart = viewMode === "chart";
  const isSmall = size === "small";

  const statusConfig = {
    unassigned: {
      color: "text-slate-400",
      icon: <Circle size={14} />,
      label: "Position Unassigned",
    },
    suggested: {
      color: "text-blue-500",
      icon: <Clock size={14} />,
      label: "Candidate Suggested",
    },
    assigned: {
      color: "text-green-600",
      icon: <CheckCircle size={14} />,
      label: "Role Approved",
    },
  };

  const currentStatus = statusConfig[status];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  const handleDragLeave = () => {
    setIsOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("person"));
      if (data) onPersonDrop(roleData.id, data);
    } catch (err) {
      // Invalid data dropped
      console.debug(err);
    }
  };

  const cardWidth = isSmall ? "w-56" : "w-64";
  const cardHeight = isSmall ? "h-auto min-h-[80px]" : "h-64";

  return (
    <div
      onMouseDown={onMouseDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute ${cardWidth} ${cardHeight} border bg-white p-5 rounded-2xl flex flex-col transition-shadow select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? `shadow-2xl ring-2 ${isOverDeleteZone ? "ring-red-500 scale-90 opacity-50" : "ring-blue-400 scale-105"} z-50`
          : "shadow-sm hover:shadow-md z-40"
      } ${isOver ? "ring-4 ring-green-400 border-transparent bg-green-50" : "border-slate-200"}`}
      style={{ left: `${x}px`, top: `${y}px`, transformOrigin: "top left" }}
    >
      <div className="flex justify-between items-start mb-2 relative">
        <div className="relative">
          {isChart && !isSmall && assignedPerson ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
              <img
                src={assignedPerson.imageUrl}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ) : isChart && !isSmall ? (
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
              <Briefcase size={18} className="text-slate-300" />
            </div>
          ) : null}
          {isChart && (
            <div
              className={`p-1 rounded-full bg-white shadow-sm border border-slate-100 ${currentStatus.color} ${!isSmall ? "absolute -bottom-1 -right-1" : ""}`}
            >
              {currentStatus.icon}
            </div>
          )}
        </div>

        {isChart && (
          <div className="relative" ref={menuRef}>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-[60] animate-in fade-in zoom-in duration-150">
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    onToggleSize(roleData.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  {isSmall ? <Maximize2 size={14} /> : <Minimize2 size={14} />}{" "}
                  Switch to {isSmall ? "Large" : "Small"}
                </button>
                <div className="h-px bg-slate-100 my-1" />
                {status === "suggested" && (
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      onApprove(roleData.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    onClear(roleData.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Clear Assignment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow overflow-hidden">
        <h2
          className={`font-bold text-slate-900 leading-tight truncate ${isSmall ? "text-sm" : "text-base"}`}
        >
          {isChart && assignedPerson ? assignedPerson.name : role}
        </h2>
        {isChart && assignedPerson && (
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5 truncate">
            {role}
          </p>
        )}
        {!isSmall && (
          <p
            className={`text-slate-500 text-[11px] leading-relaxed line-clamp-4 mt-2 transition-all italic`}
          >
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};
