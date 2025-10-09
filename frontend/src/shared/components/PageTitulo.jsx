// PageTitulo.jsx
import React from "react";

export default function PageTitulo({ titulo, children, className = "titulo"}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h1 className={className}>{titulo}</h1>
      {children}
    </div>
  );
}
