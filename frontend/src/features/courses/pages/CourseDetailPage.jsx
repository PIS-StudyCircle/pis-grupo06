import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useCourse } from "../hooks/useCourse";
import { favoriteCourse, unfavoriteCourse } from "../services/courseService";
import SubjectPage from "@/features/subjects/pages/SubjectPage";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);
  const [favorite, setFavorite] = useState(!!course?.favorite);
  useEffect(() => {setFavorite(!!course?.favorite);}, [course?.favorite]);
  const [msg, setMsg] = useState("");

  const toggleFavorite = useCallback(async () => {
    if (!course.id) return;
    try {
      if (!favorite) {
        await favoriteCourse(course.id);
        setFavorite(true);
      } else {
        await unfavoriteCourse(course.id);
        setFavorite(false);
      }
    } catch (error) {
      if (error?.status === 401) {
        setMsg(error?.payload?.error || "Debes iniciar sesión para actualizar favoritos.");
        setTimeout(() => setMsg(""), 3000);
        return;
      }

      setMsg(error?.payload?.error || error?.message || "Error al actualizar favorito.");
      setTimeout(() => setMsg(""), 3000);
    }
  }, [course, favorite]);

  return (
    <div className="flex flex-col bg-gray-50">
        {loading && (
          <div className="p-6 max-w-3xl mx-auto">Cargando curso...</div>
        )}
        {error && (
          <div className="p-6 max-w-3xl mx-auto text-red-600">
            Error: {error.message}
          </div>
        )}
        {!loading && !error && !course && (
          <div className="p-6 max-w-3xl mx-auto">No se encontró el curso.</div>
        )}

        {!loading && !error && course && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Card del curso */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Columna izquierda - info */}
                <div className="md:col-span-2 text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3 w-full">

                    {/* el nombre ocupa el espacio restante */}
                    <span className="min-w-0 flex-1 truncate">{course.name}</span>

                    {/* la estrella se pega a la derecha dentro de estas 2 columnas */}
                    <button
                      type="button"
                      onClick={toggleFavorite}
                      aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                      title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className={`w-5 h-5 ${favorite ? "text-yellow-400" : "text-gray-300"}`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 22 20"
                        fill="currentColor"
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                    </button>
                  </h1>

                  {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}

                  <div className="space-y-1 pl-[2px]">
                    {course.code && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Código:</span>{" "}
                        {course.code}
                      </p>
                    )}
                    {course.institute && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Instituto:</span>{" "}
                        {course.institute}
                      </p>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-gray-700 mt-4">{course.description}</p>
                  )}
                </div>

                {/* Columna derecha - botones */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className="btn w-full"
                    onClick={() => navigate(`/tutorias/ser_tutor/${courseId}`)}
                  >
                    Brindar tutoría
                  </button>
                  <button
                    type="button"
                    className="btn w-full"
                    onClick={() => navigate(`/tutorias/materia/${courseId}`)}
                  >
                    Recibir tutoría
                  </button>
                </div>
              </div>

              {/*El mostrar los temas de la materia se delega a SubjectPage*/}
              <SubjectPage
                courseId={courseId}
              />
            </div>
          </div>
        )}
    </div>
  );
}
