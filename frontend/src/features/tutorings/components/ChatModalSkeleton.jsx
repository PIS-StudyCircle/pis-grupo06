export default function ChatModalSkeleton() {
  // Skeleton que replica la estructura del ChatModal:
  // - mensajes de otros: avatar a la izquierda, nombre (opcional), burbuja y hora debajo (alineado a la izquierda)
  // - mensajes propios: burbuja y hora alineadas a la derecha (sin avatar)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Cargando chat"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg flex flex-col" style={{ height: 600 }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Fecha centrada arriba del chat (skeleton) */}
        <div className="py-3 flex justify-center">
          <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Mensajes */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {Array.from({ length: 6 }).map((_, i) => {
            const isSelf = i % 2 === 0;

            const bubbleWidthClass = i % 3 === 0 ? "w-48" : i % 3 === 1 ? "w-36" : "w-56";
            const timeWidthClass = i % 2 === 0 ? "w-16" : "w-12";

            if (!isSelf) {
              return (
                <div key={i} className="flex items-start gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 animate-pulse" />

                  <div className="flex flex-col max-w-[80%] min-w-0">
                    <div className="h-3 w-28 bg-gray-200 rounded mb-1 animate-pulse" />
                    <div className={`p-2 rounded bg-gray-200 animate-pulse ${bubbleWidthClass}`} style={{ minHeight: 36 }} />
                    <div className={`h-3 ${timeWidthClass} bg-gray-200 rounded mt-1 animate-pulse`} />
                  </div>
                </div>
              );
            } else {
              return (
                <div key={i} className="flex items-start gap-2 justify-end">
                  <div className="flex flex-col items-end max-w-[80%] min-w-0">
                    <div className={`p-2 rounded bg-blue-100 animate-pulse ${bubbleWidthClass}`} style={{ minHeight: 36 }} />
                    <div className={`h-3 ${timeWidthClass} bg-gray-200 rounded mt-1 animate-pulse`} />
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}