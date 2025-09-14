import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@components/NavBar";
import Footer from "@components/Footer";
import { useCourse } from "../hooks/useCourse";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { course, loading, error } = useCourse(courseId);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />

      <main className="flex-1">
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {course.name}
                  </h1>

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
                    onClick={() =>
                      navigate(`/tutor/registrarse?course=${course.id}`)
                    }
                  >
                    Ser tutor
                  </button>
                  <button
                    type="button"
                    className="btn w-full"
                    onClick={() =>
                      navigate(`/tutoria/solicitar?course=${course.id}`)
                    }
                  >
                    Recibir tutoría
                  </button>
                </div>
              </div>

              {/* Divider sutil */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Temas
                </h2>

                {Array.isArray(course.subjects) &&
                course.subjects.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {course.subjects.map((s) => (
                      <li
                        key={s.id}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 p-3 border rounded-md bg-gray-50 text-sm text-gray-500 text-center">
                    Todavía no hay temas asociados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
