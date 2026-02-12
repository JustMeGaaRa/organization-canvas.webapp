import { useState, type FC } from "react";
import { type Role } from "../../types";
import { RoleStatus } from "./RoleStatus";
import { RoleAvatar } from "./RoleAvatar";
import { RoleInfo } from "./RoleInfo";
import { RoleMenu } from "./RoleMenu";

/**
 * RoleCard Component
 */
export const RoleCard: FC<{
  roleData: Role;
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
  isSelected?: boolean;
  viewMode: "chart" | "structure";
  animate?: boolean;
}> = ({
  roleData,
  isDragging,
  onMouseDown,
  onPersonDrop,
  onApprove,
  onClear,
  onToggleSize,
  isOverDeleteZone,
  isSelected,
  viewMode,
  animate = false,
}) => {
  const [isOver, setIsOver] = useState(false);

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
      className={`absolute ${cardWidth} ${cardHeight} border bg-white p-5 rounded-2xl flex flex-col select-none cursor-grab active:cursor-grabbing ${
        animate
          ? "transition-[top,left,width,height,box-shadow] duration-500 ease-in-out"
          : "transition-shadow"
      } ${
        isDragging
          ? `shadow-2xl ring-2 ${isOverDeleteZone ? "ring-red-500 scale-90 opacity-50" : "ring-blue-400"} z-50`
          : `shadow-sm hover:shadow-md z-40 ${isSelected ? "ring-2 ring-blue-500 border-transparent" : ""}`
      } ${isOver ? "ring-4 ring-green-400 border-transparent bg-green-50" : !isDragging && !isSelected ? "border-slate-200" : ""}`}
      style={{ left: `${x}px`, top: `${y}px`, transformOrigin: "top left" }}
    >
      <div className="flex justify-between items-start mb-2 relative">
        <div className="relative">
          <RoleAvatar
            isChart={isChart}
            isSmall={isSmall}
            assignedPerson={assignedPerson}
          />
          <RoleStatus status={status} isChart={isChart} isSmall={isSmall} />
        </div>

        <RoleMenu
          isChart={isChart}
          isSmall={isSmall}
          roleData={roleData}
          status={status}
          onToggleSize={onToggleSize}
          onApprove={onApprove}
          onClear={onClear}
        />
      </div>
      <RoleInfo
        isChart={isChart}
        isSmall={isSmall}
        role={role}
        summary={summary}
        assignedPerson={assignedPerson}
      />
    </div>
  );
};
