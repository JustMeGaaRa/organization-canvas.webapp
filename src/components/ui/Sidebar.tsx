import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import type { FC, ReactNode } from "react";

/**
 * Determines how the sidebar panel should open based on viewport width.
 *
 * - < 1024px  → "top-sheet"   slides down from the top edge, consistent with
 *                              the merged top-toolbar layout at this breakpoint.
 *                              Works for narrow desktop windows AND tablets in
 *                              portrait (both are typically < 1024 px wide).
 * - ≥ 1024px  → "right-panel" slides in from the right (tablets in landscape,
 *                              desktops — enough horizontal room for a panel).
 *
 * Using the same breakpoint as the toolbar collapse (`max-width: 1023px` /
 * Tailwind `lg`) keeps all layout-mode changes consistent.
 */
interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  position?: "bottom" | "right";
}

const SidebarRoot: FC<SidebarProps> = ({
  isOpen,
  position = "right",
  children,
  className = "",
}) => {
  const isBottom = position === "bottom";

  const variants: Variants = {
    open: {
      opacity: 1,
      x: isBottom ? "-50%" : 0,
      y: isBottom ? 0 : "-50%",
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.1 },
    },
    closed: {
      opacity: 0,
      x: isBottom ? "calc(-50% + 50px)" : 0,
      y: isBottom ? 0 : "calc(-50% + 50px)",
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="fixed z-50 pointer-events-none inset-0">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={position}
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            className={`absolute pointer-events-auto overflow-hidden bg-white shadow-2xl border border-slate-200 flex flex-col rounded-2xl ${
              isBottom
                ? "bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] left-1/2 w-[90vw] max-w-136 h-[450px] origin-bottom"
                : "top-1/2 right-24 w-80 h-[calc(100dvh-12rem)] origin-right"
            } ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

const SidebarHeader: FC<SidebarHeaderProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm ${className}`}
  >
    {children}
  </div>
);

interface SidebarTitleProps {
  children: ReactNode;
  className?: string;
}

const SidebarTitle: FC<SidebarTitleProps> = ({ children, className = "" }) => (
  <h2 className={`text-lg font-bold text-slate-800 ${className}`}>
    {children}
  </h2>
);

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

const SidebarContent: FC<SidebarContentProps> = ({
  children,
  className = "",
}) => (
  <div className={`flex-grow overflow-y-auto ${className}`}>{children}</div>
);

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

const SidebarFooter: FC<SidebarFooterProps> = ({
  children,
  className = "",
}) => (
  <div className={`p-4 border-t border-slate-100 bg-slate-50 ${className}`}>
    {children}
  </div>
);

interface SidebarCloseButtonProps {
  onClose: () => void;
}

const SidebarCloseButton: FC<SidebarCloseButtonProps> = ({ onClose }) => (
  <button
    onClick={onClose}
    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
  >
    <X size={16} />
  </button>
);

export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Title: SidebarTitle,
  Content: SidebarContent,
  Footer: SidebarFooter,
  CloseButton: SidebarCloseButton,
});
