import { useState, useRef, useEffect, type FC } from "react";
import {
  MoreHorizontal,
  Maximize2,
  Minimize2,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface RoleMenuProps {
  variant: "simple" | "detailed";
  isSmall: boolean;
  roleData: { id: string };
  status?: "unassigned" | "suggested" | "assigned";
  onToggleSize: (roleId: string) => void;
  onApprove: (roleId: string) => void;
  onClear: (roleId: string) => void;
}

export const RoleMenu: FC<RoleMenuProps> = ({
  variant,
  isSmall,
  roleData,
  status,
  onToggleSize,
  onApprove,
  onClear,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  if (variant === "simple") return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-[60] animate-in fade-in zoom-in duration-150">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              onToggleSize(roleData.id);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            {isSmall ? <Maximize2 size={14} /> : <Minimize2 size={14} />} Switch
            to {isSmall ? "Large" : "Small"}
          </button>
          <div className="h-px bg-slate-100 my-1" />
          {status === "suggested" && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
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
            onPointerDown={(e) => e.stopPropagation()}
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
  );
};
