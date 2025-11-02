import { Link } from "react-router-dom";

export default function TutoringActions({ 
  mode, 
  saving, 
  onSerTutor, 
  onUnirme, 
  onDesuscribirme 
}) {
  return (
    <aside className="lg:col-span-1">
      <div className="rounded-xl border bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Acciones</h3>
        <div className="mt-3 flex flex-col gap-2">
          {mode === "serTutor" && (
            <button
              type="button"
              className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={onSerTutor}
              disabled={saving}
            >
              Ser tutor
            </button>
          )}

          {mode === "serEstudiante" && (
            <button
              type="button"
              className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={onUnirme}
              disabled={saving}
            >
              Unirme
            </button>
          )}

          {mode === "ambos" && (
            <>
              <button
                type="button"
                className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={onSerTutor}
                disabled={saving}
              >
                Ser tutor
              </button>
              <button
                type="button"
                className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={onUnirme}
                disabled={saving}
              >
                Unirme
              </button>
            </>
          )}

          {mode === "misTutorias" && (
            <button
              type="button"
              className="btn w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={onDesuscribirme}
              disabled={saving}
            >
              Desuscribirme
            </button>
          )}

          {mode === "completo" && (
            <button
              type="button"
              className="btn w-full bg-gray-400 text-gray-700 cursor-not-allowed"
              disabled
            >
              Completo
            </button>
          )}

          <Link
            to="/tutorias"
            className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    </aside>
  );
}