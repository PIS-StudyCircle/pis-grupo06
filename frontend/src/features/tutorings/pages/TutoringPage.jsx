import { useMemo } from "react";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";
import Pagination from "@components/Pagination";
import { useParams, useNavigate } from "react-router-dom";

export default function TutoringPage({ filters = {}, mode = "" }) {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Memoriza los filtros para evitar loop infinito
  const filtersConId = useMemo(() => ({ ...filters, course_id: courseId }), [filters, courseId]);

  const { tutorings, loading, error, pagination, page, setPage } = useTutorings(
    1,
    20,
    filtersConId
  );

  const totalPages = pagination.last || 1;

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold p-2 text-black">

              Tutorías Disponibles
            </h1>

            {mode === "serTutor" && (
              <button
                type="button"
                className="btn"
                onClick={() =>
                  navigate(`/tutorias/elegir_temas/tutor/${courseId}`)
                }
              >
                Crear nueva tutoría
              </button>
            )}

            {mode === "serEstudiante" && (
              <button
                type="button"
                className="btn"
                onClick={() =>
                  navigate(`/tutorias/elegir_temas/estudiante/${courseId}`)
                }
              >
                Solicitar nueva tutoría
              </button>
            )}
          </div>
          <TutoringList
            tutorings={tutorings}
            mode={mode}
            loading={loading}
            error={error}
          />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
