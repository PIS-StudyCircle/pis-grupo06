export function Error404Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-7xl font-bold text-gray-800">Error 404</h1>
      <p className="mt-4 text-xl text-gray-600">Página no encontrada.</p>
      <p className="text-gray-500 mt-2">
        La ruta que intentaste acceder no existe o fue movida.
      </p>
      <a
        href="/"
        className="mt-6 inline-block rounded-xl bg-[#1162D4] px-6 py-3 text-white font-medium shadow hover:bg-[#2073E8] transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
