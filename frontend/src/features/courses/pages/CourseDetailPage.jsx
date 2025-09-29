import { useParams, useNavigate } from "react-router-dom";
import Footer from "@components/Footer";
import { useCourse } from "../hooks/useCourse";
import SubjectPage from "@/features/subjects/pages/SubjectPage";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                    onClick={() => navigate(`/tutorias/buscar_tutor/${course.id}`)}
                  >
                    Brindar tutoría
                  </button>
                  <button
                    type="button"
                    className="btn w-full"
                    // onClick={() => navigate(`/tutoria/solicitar?${course.id}`)}
                  >
                    Recibir tutoría
                  </button>
                </div>
              </div>

              {/*El mostrar los temas de la materia se delega a SubjectPage*/}
              <SubjectPage
                courseId={course.id}
                showCreate={false}
                type=""
                //onButtonClick={(subjectId) => navigate(`/temas/${subjectId}`)}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
