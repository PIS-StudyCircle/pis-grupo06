/**
 * Badge para mostrar el estado de una tutoría
 */
export function EstadoBadge({ state }) {
  if (!state) return null;
  
  const mapping = {
    active: { text: "Activa", cls: "bg-green-100 text-green-800 border-green-200" },
    pending: { text: "Pendiente", cls: "bg-blue-100 text-blue-800 border-blue-200" },
    finished: { text: "Finalizada", cls: "bg-gray-200 text-gray-700 border-gray-300" },
    canceled: { text: "Cancelada", cls: "bg-red-100 text-red-700 border-red-200" },
  };
  
  const info = mapping[state] || { text: state, cls: "bg-gray-100 text-gray-800 border-gray-200" };
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full border ${info.cls}`}>
      {info.text}
    </span>
  );
}

/**
 * Skeleton loader para la página de detalle de tutoría
 */
export function ShowTutoringSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 animate-pulse">
      <div className="rounded-2xl bg-white shadow overflow-hidden">
        <div className="px-6 py-5 border-b bg-gray-100" />
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-100 rounded" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-gray-50 p-4 h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}