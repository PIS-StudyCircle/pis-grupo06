import { Link } from "react-router-dom";

export default function TutoringActions({ 
  mode, 
  saving, 
  onSerTutor, 
  onUnirme, 
  onDesuscribirme,
  onOpenChat,
  tutoringState = "pending",
}) {
  if (tutoringState === "finished") {
    return (
      <aside className="lg:col-span-1">
        <div className="rounded-xl border bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Tutoría finalizada</h3>
           <Link
            to="/tutorias"
            className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full mt-3"
          >
            Volver al listado
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="lg:col-span-1">
      <div className="rounded-xl border bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Acciones</h3>
        <div className="mt-3 flex flex-col gap-2">
          {mode === "serTutor" && (
            <button
              type="button"
              className={`btn w-full font-semibold transition ${
                  saving
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                }`}
              onClick={onSerTutor}
              disabled={saving}
            >
              {saving ? "Uniéndote a la tutoría como tutor..." : "Ser Tutor"}
            </button>
          )}

          {mode === "serEstudiante" && (
            <button
              type="button"
              className={`btn w-full font-semibold transition ${
                  saving
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                }`}
              onClick={onUnirme}
              disabled={saving}
            >
              {saving ? "Uniéndote a la tutoría..." : "Unirme"}
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
                className={`btn w-full font-semibold transition ${
                  saving
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white"
                }`}
                onClick={onUnirme}
                disabled={saving}
              >
                {saving ? "Uniéndote a la tutoría..." : "Unirme"}
              </button>
            </>
          )}

          {mode === "misTutorias" && (
            <div className="flex gap-2 flex-col">
              {tutoringState !== "pending" && (
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={saving}
                >
                  Abrir chat
                </button>
              )}
              <button
                type="button"
                className={`btn w-full font-semibold transition ${
                    saving
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                      : "bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white"
                  }`}
                onClick={onDesuscribirme}
                disabled={saving}
              >
                {saving ? "Desuscribiéndote a la tutoría..." : "Desuscribirme"}
              </button>
            </div>
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
            to={saving ? "#" : "/tutorias"}
            onClick={(e) => saving && e.preventDefault()}
            className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium 
              ${saving ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none" : "bg-white hover:bg-gray-50 text-gray-700"}
            `}
          >
            Volver al listado
          </Link>
        </div>
      </div>
    </aside>
  );
}