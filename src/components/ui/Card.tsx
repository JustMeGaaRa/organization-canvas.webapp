import { motion } from "framer-motion";
import type { FC, ReactNode, HTMLAttributes } from "react";

interface CardRootProps {
  children: ReactNode;
  className?: string;
  variant?: "simple" | "detailed";
  isDragging?: boolean;
  isSelected?: boolean;
  isDanger?: boolean;
  animate?: boolean;
  onClick?: () => void;
  onPointerDown?: React.PointerEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onDragOver?: React.DragEventHandler;
  onDragLeave?: React.DragEventHandler;
  onDrop?: React.DragEventHandler;
  style?: React.CSSProperties;
  "data-card-id"?: string;
}

const CardRoot: FC<CardRootProps> = ({
  children,
  className = "",
  isDragging = false,
  isSelected = false,
  isDanger = false,
  animate = false,
  style,
  ...props
}) => {
  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={animate ? { opacity: 0, scale: 0.8 } : undefined}
      transition={{ duration: 0.3 }}
      className={`absolute border bg-white rounded-2xl flex flex-col select-none cursor-grab active:cursor-grabbing ${
        animate
          ? "transition-[top,left,width,height,box-shadow] duration-500 ease-in-out"
          : "transition-shadow"
      } ${
        isDragging
          ? `shadow-2xl ring-2 ${isDanger ? "ring-red-500 scale-90 opacity-50" : "ring-blue-400"} z-50`
          : `shadow-sm hover:shadow-md z-40 ${isSelected ? "ring-2 ring-blue-500 border-transparent" : "border-slate-200"}`
      } ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`flex justify-between items-start relative ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardBody: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`flex-grow overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-auto ${className}`} {...props}>
    {children}
  </div>
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
