import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@components/Footer";
import { useCourse } from "../../courses/hooks/useCourse";
import SubjectPage from "../../subjects/pages/SubjectPage";

export default function CreateTutoringByStudent() {
  const { courseId } = useParams();
  const { course, loadingCourse, errorCourse } = useCourse(courseId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate();


  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("selectedSubjects", JSON.stringify(selectedSubjects));
    navigate(`/tutoria/nueva/${courseId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            {loadingCourse && (
              <div className="p-6 max-w-3xl mx-auto">Cargando curso...</div>
            )}
            {errorCourse && (
              <div className="p-6 max-w-3xl mx-auto text-red-600">
                Error: {errorCourse.message}
              </div>
            )}
            <div className="p-6 max-w-3xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course && course.name}
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-gray-700 mb-6">
                  Selecciona los temas que deseas incluir en tu tutoríaa.
                </p>
                <button
                  type="submit"
                  className={`btn btn-primary mt-4 ${selectedSubjects.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={selectedSubjects.length === 0}
                >
                  Guardar selección
                </button>
              </form>

              <SubjectPage courseId={courseId} showButton={true} selectedSubjects={selectedSubjects} onSelectionChange={setSelectedSubjects} />

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}