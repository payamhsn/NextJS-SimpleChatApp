import React from "react";

export default function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs ${className}`}>{children}</span>;
}