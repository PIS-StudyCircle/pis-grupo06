// PageTitle.jsx
import React from "react";

export default function PageTitle({ title, children, className = "titulo"}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h1 className={className}>{title}</h1>
      {children}
    </div>
  );
}
