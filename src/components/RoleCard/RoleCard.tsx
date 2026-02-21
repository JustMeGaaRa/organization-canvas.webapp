import { useState, type FC } from "react";
import { type Role } from "../../types";
import { RoleStatus } from "./RoleStatus";
import { RoleAvatar } from "./RoleAvatar";
import { RoleInfo } from "./RoleInfo";
import { RoleMenu } from "./RoleMenu";
import { Card as CardPrimitive } from "../ui/Card";

/**
 * RoleCard Component
 */
export const RoleCard: FC<{
  roleData: Role;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPersonDrop: (
    roleId: string,
    personData: { id: string; name: string; imageUrl: string },
  ) => void;
  onApprove: (roleId: string) => void;
  onClear: (roleId: string) => void;
  onToggleSize: (roleId: string) => void;
  isDanger: boolean;
  isSelected?: boolean;
  isPersonTouchDragOver?: boolean;
  variant: "simple" | "detailed";
  animate?: boolean;
}> = ({
  roleData,
  isDragging,
  onPointerDown,
  onPersonDrop,
  onApprove,
  onClear,
  onToggleSize,
  isDanger,
  isSelected,
  isPersonTouchDragOver,
  variant,
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
    <CardPrimitive
      animate={animate}
      isDragging={isDragging}
      isSelected={isSelected}
      isDanger={isDanger}
      onPointerDown={onPointerDown}
      onDragOver={handleDragOver}
      data-card-id={roleData.id}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${cardWidth} ${cardHeight} p-5 ${isOver || isPersonTouchDragOver ? "ring-4 ring-green-400 border-transparent bg-green-50" : ""}`}
      style={{ left: `${x}px`, top: `${y}px`, transformOrigin: "top left" }}
    >
      <CardPrimitive.Header className="mb-2">
        <div className="relative">
          <RoleAvatar
            variant={variant}
            isSmall={isSmall}
            assignedPerson={assignedPerson}
          />
          <RoleStatus status={status} variant={variant} isSmall={isSmall} />
        </div>

        <RoleMenu
          variant={variant}
          isSmall={isSmall}
          roleData={roleData}
          status={status}
          onToggleSize={onToggleSize}
          onApprove={onApprove}
          onClear={onClear}
        />
      </CardPrimitive.Header>

      <CardPrimitive.Body className="flex flex-col">
        <RoleInfo
          variant={variant}
          isSmall={isSmall}
          role={role}
          summary={summary}
          assignedPerson={assignedPerson}
        />
      </CardPrimitive.Body>
    </CardPrimitive>
  );
};
