import * as React from "react";
import { twMerge } from "tailwind-merge";
import { FiEye, FiEyeOff } from "react-icons/fi";

type InputElementProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaElementProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputProps = {
  icon?: React.ReactNode;
  type?: string;
} & (
  | (InputElementProps & {
      type?: "text" | "password" | "email" | "number" | string;
    })
  | (TextareaElementProps & { type: "textarea" })
);

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ className, type, icon, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const isTextarea = type === "textarea";

  const baseStyles =
    "flex w-full rounded-xl border-2 border-primary-100 bg-primary-50 px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/10 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-primary-900 shadow-xs";

  if (isTextarea) {
    return (
      <textarea
        className={twMerge(baseStyles, "min-h-[100px] resize-y", className)}
        ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
        {...(props as TextareaElementProps)}
      />
    );
  }

  return (
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary-400 group-focus-within:text-brand-600 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className={twMerge(
          baseStyles,
          icon && "pl-12",
          isPassword && "pr-12",
          className,
        )}
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        {...(props as InputElementProps)}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-4 flex items-center text-primary-400 hover:text-brand-600 focus:outline-none transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <FiEyeOff className="size-[18px]" />
          ) : (
            <FiEye className="size-[18px]" />
          )}
        </button>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
