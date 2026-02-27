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
  isExpanded?: boolean;
}

const SidebarRoot: FC<SidebarProps> = ({
  isOpen,
  position = "right",
  children,
  className = "",
  isExpanded = false,
  onClose,
}) => {
  const isBottom = position === "bottom";

  const variants: Variants = {
    open: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      opacity: 0,
      x: isExpanded ? 0 : isBottom ? 50 : 0,
      y: isExpanded ? 0 : isBottom ? 0 : 50,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const panelClasses = isExpanded
    ? "inset-0 m-auto w-[90vw] max-w-4xl h-[85vh] origin-center"
    : isBottom
      ? "bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] inset-x-0 mx-auto w-[90vw] max-w-136 h-[450px] origin-bottom"
      : "inset-y-0 my-auto right-24 w-80 h-[calc(100dvh-12rem)] origin-right";

  return (
    <div className="fixed z-50 pointer-events-none inset-0 flex justify-center items-center">
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="sidebar-panel"
            layout
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            className={`absolute pointer-events-auto overflow-hidden bg-white shadow-2xl border border-slate-200 flex flex-col rounded-2xl ${panelClasses} ${className}`}
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
