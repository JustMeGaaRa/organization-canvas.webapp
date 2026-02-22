import type { FC, ReactNode, ButtonHTMLAttributes } from "react";

interface ToolbarRootProps {
  children: ReactNode;
  className?: string;
}

const ToolbarRoot: FC<
  ToolbarRootProps & React.RefAttributes<HTMLDivElement>
> = ({ children, className = "", ...props }) => (
  <div
    className={`flex items-center p-1.5 rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm border border-slate-200/60 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface ToolbarGroupProps {
  children: ReactNode;
  className?: string;
}

const ToolbarGroup: FC<ToolbarGroupProps> = ({ children, className = "" }) => (
  <div className={`flex items-center gap-1 ${className}`}>{children}</div>
);

interface ToolbarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  variant?: "default" | "danger" | "nav";
  icon?: ReactNode;
  label?: string;
}

const ToolbarItem: FC<ToolbarItemProps> = ({
  isActive,
  variant = "default",
  icon,
  label,
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
      {...props}
    >
      {icon}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

const ToolbarSeparator: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`w-px h-6 bg-slate-200 mx-1 ${className}`} />
);

export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Item: ToolbarItem,
  Separator: ToolbarSeparator,
});
