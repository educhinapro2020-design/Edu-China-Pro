import * as React from "react";
import { twMerge } from "tailwind-merge";
import { FiLoader } from "react-icons/fi";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "dark" | "secondary" | "outline" | "ghost" | "link" | "brand";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "brand",
      size = "default",
      asChild = false,
      startIcon,
      endIcon,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = "button";

    const renderStartIcon = () => {
      if (loading && startIcon) {
        return <FiLoader className="w-4 h-4 animate-spin" />;
      }
      return startIcon;
    };

    const renderEndIcon = () => {
      if (loading && endIcon) {
        return <FiLoader className="w-4 h-4 animate-spin" />;
      }
      if (loading && !startIcon && !endIcon) {
        return <FiLoader className="w-4 h-4 animate-spin" />;
      }
      return endIcon;
    };

    return (
      <Comp
        className={twMerge(
          "inline-flex items-center cursor-pointer active:scale-[0.95] justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "dark" &&
            "bg-primary-900 text-primary-50 hover:bg-primary-800 shadow-sm hover:shadow-md",
          variant === "brand" &&
            "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30",
          variant === "secondary" &&
            "bg-primary-100 text-primary-900 hover:bg-primary-200",
          variant === "outline" &&
            "border border-primary-200 bg-white hover:bg-primary-50 hover:text-primary-900 shadow-xs",
          variant === "ghost" && "hover:bg-primary-100 hover:text-primary-900",
          variant === "link" &&
            "text-primary-900 underline-offset-4 hover:underline",

          size === "default" &&
            "h-12 rounded-2xl px-8 text-base font-medium shadow-sm",
          size === "sm" && "h-10 rounded-xl px-4 text-sm font-medium shadow-xs",
          size === "lg" && "h-14 rounded-3xl px-10 text-lg font-bold shadow-xl",
          size === "xl" &&
            "h-16 rounded-4xl px-12 text-xl font-bold shadow-2xl",
          size === "icon" && "h-12 w-12 rounded-2xl",
          className,
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {renderStartIcon()}
        {children}
        {renderEndIcon()}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
