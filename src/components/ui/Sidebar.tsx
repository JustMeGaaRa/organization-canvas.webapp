import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import type { FC, ReactNode } from "react";
import { useState, useEffect } from "react";

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
type SidebarLayout = "top-sheet" | "right-panel";

function useSidebarLayout(): SidebarLayout {
  const MQ = "(max-width: 1023px)";

  const detect = (): SidebarLayout => {
    if (typeof window === "undefined") return "right-panel";
    return window.matchMedia(MQ).matches ? "top-sheet" : "right-panel";
  };

  const [layout, setLayout] = useState<SidebarLayout>(detect);

  useEffect(() => {
    const mq = window.matchMedia(MQ);
    const update = () => setLayout(detect());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return layout;
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  position?: "left" | "right";
  className?: string;
}

const SidebarRoot: FC<SidebarProps> = ({
  isOpen,
  children,
  position = "right",
  className = "",
}) => {
  const layout = useSidebarLayout();

  const variants: Variants =
    layout === "top-sheet"
      ? {
          // Slides DOWN from above the top edge
          open: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 },
          },
          closed: {
            y: "-100%",
            opacity: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
          },
        }
      : {
          // Slides in from the right (or left)
          open: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 },
          },
          closed: {
            x: position === "right" ? "100%" : "-100%",
            opacity: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
          },
        };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Panel wrapper ── */}
          <div
            className={`fixed z-50 pointer-events-none ${
              layout === "top-sheet" ? "inset-x-0 top-0" : "inset-0"
            }`}
          >
            <motion.div
              // Re-mount on layout change so the enter animation is correct
              key={layout}
              initial="closed"
              animate="open"
              exit="closed"
              variants={variants}
              // Safe-area top padding is applied inline so the panel content
              // clears the iPad notch/status-bar when it slides in from above.
              style={
                layout === "top-sheet"
                  ? { paddingTop: "env(safe-area-inset-top, 0px)" }
                  : undefined
              }
              className={
                layout === "top-sheet"
                  ? // ── Top sheet (portrait touch) ──
                    // Full-width, slides from above, canvas below stays visible.
                    `absolute top-0 left-0 right-0 h-[55vh] rounded-b-2xl bg-white shadow-2xl border-b border-slate-200 flex flex-col pointer-events-auto overflow-hidden ${className}`
                  : // ── Right panel (landscape touch + desktop) ──
                    `absolute top-0 ${
                      position === "right" ? "right-0" : "left-0"
                    } h-[calc(100%-2rem)] m-4 rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col w-80 pointer-events-auto overflow-hidden ${className}`
              }
            >
              {children}

              {/* Drag-handle pill at the BOTTOM of the top sheet */}
              {layout === "top-sheet" && (
                <div className="flex justify-center pb-3 pt-1 flex-shrink-0">
                  <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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
