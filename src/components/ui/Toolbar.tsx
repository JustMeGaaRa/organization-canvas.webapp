import {
  forwardRef,
  type FC,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";

interface ToolbarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRootProps>(
  ({ children, className = "", orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center gap-2 ${
        orientation === "vertical" ? "flex-col" : "flex-row"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);
ToolbarRoot.displayName = "ToolbarRoot";

interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(
  ({ children, className = "", orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center p-1.5 rounded-full shadow-xl bg-white/90 backdrop-blur-sm border border-slate-200/60 transition-all duration-300 gap-1 ${
        orientation === "vertical" ? "flex-col" : "flex-row"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);
ToolbarGroup.displayName = "ToolbarGroup";

interface ToolbarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  variant?: "default" | "danger" | "nav";
  icon?: ReactNode;
  label?: string;
  title?: string;
}

const ToolbarItem: FC<ToolbarItemProps> = ({
  isActive,
  variant = "default",
  icon,
  label,
  title,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "relative flex items-center gap-2 px-3 py-2 [@media(hover:none)]:py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap";

  const variants = {
    default: isActive
      ? "bg-slate-900 text-white shadow-md"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-700",
    nav: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      title={title}
      {...props}
    >
      {icon}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

interface ToolbarSeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const ToolbarSeparator: FC<ToolbarSeparatorProps> = ({
  className = "",
  orientation = "horizontal",
}) => (
  <div
    className={`${
      orientation === "vertical"
        ? "w-6 h-px mx-0 my-1 bg-slate-200"
        : "w-px h-6 bg-slate-200 mx-1"
    } ${className}`}
  />
);

export const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Group: ToolbarGroup,
  Item: ToolbarItem,
  Separator: ToolbarSeparator,
});
