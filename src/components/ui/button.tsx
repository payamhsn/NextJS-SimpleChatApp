import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" };

export default function Button({ className = "", variant = "primary", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-900",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  } as const;
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}