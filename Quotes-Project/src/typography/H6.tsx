import React from "react";

interface H6Props {
  children: React.ReactNode;
}

export function H6({ children }: H6Props) {
  return (
    <h6 className="text-lg font-semibold text-slate-700">{children}</h6>
  );
}
