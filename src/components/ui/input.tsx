import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  return <input className={`w-full border rounded px-3 py-2 text-sm ${className}`} {...props} />;
}