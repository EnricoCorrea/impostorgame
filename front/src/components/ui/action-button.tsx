import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

export function ActionButton({ children, variant = "primary", loading, className = "", disabled, ...props }: Props) {
  return (
    <button className={`button button-${variant} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="spinner" aria-label="Carregando" /> : children}
    </button>
  );
}
