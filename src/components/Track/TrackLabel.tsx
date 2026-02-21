import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface TrackLabelProps {
  name: string;
  isSelected: boolean;
  onNameChange: (newName: string) => void;
  onStartEditing?: (e: React.MouseEvent) => void;
}

export const TrackLabel = ({
  name,
  isSelected,
  onNameChange,
  onStartEditing,
}: TrackLabelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name || "New Group");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempName(name || "New Group");
    setIsEditing(true);
    if (onStartEditing) onStartEditing(e);
  };

  const handleNameSave = () => {
    setIsEditing(false);
    if (tempName.trim()) {
      onNameChange(tempName);
    } else {
      setTempName(name || "New Group");
    }
  };

  return (
    <div
      className={`absolute bottom-full left-4 px-3 py-1 rounded-t-lg rounded-b-none text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm border-x border-t border-b-0 z-30 ${
        isSelected
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-slate-300 text-slate-700 border-slate-300 hover:bg-slate-400 hover:border-slate-400"
      }`}
      onClick={handleStartEditing}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNameSave();
            e.stopPropagation();
          }}
          className={`bg-transparent outline-none min-w-[60px] text-center ${isSelected ? "text-white placeholder-blue-200" : "text-slate-900"}`}
          style={{ width: `${Math.max(tempName.length * 8, 60)}px` }}
        />
      ) : (
        <>
          {name || "Group"}
          <Pencil
            size={10}
            className={`opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-60 transition-opacity ${isSelected ? "text-white" : "text-slate-500"}`}
          />
        </>
      )}
    </div>
  );
};
