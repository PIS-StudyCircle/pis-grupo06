import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "@components/Footer";
import { useCourse } from "../../courses/hooks/useCourse";
import SubjectPage from "../../subjects/pages/SubjectPage";
import PageTitle from "@/shared/components/PageTitle";

export default function SelectSubjectsByTutor() {
  const { courseId, mode } = useParams();
  const role = (mode ?? "tutor").toLowerCase();
  const isTutor = role === "tutor";
  const { course, loadingCourse, errorCourse } = useCourse(courseId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("selectedSubjects", JSON.stringify(selectedSubjects));
   
  
    navigate(isTutor ? `/tutorias/crear/${courseId}`
                     : `/tutorias/solicitar/${courseId}`);
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
              <PageTitle title={course && course.name}/>
              <form onSubmit={handleSubmit} className="space-y-6 justify-items-start ml-3">
                <p className="text-gray-700 mb-6">
                  {isTutor
                    ? "Seleccioná los temas que vas a cubrir en tu tutoría."
                    : "Seleccioná los temas que querés solicitar en una tutoría."}
                </p>
                <button
                  type="submit"
                  className={`btn btn-primary mt-4 ${selectedSubjects.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={selectedSubjects.length === 0}
                >
                  {isTutor ? "Continuar a crear tutoría" : "Continuar a solicitar tutoría"}
                </button>
              </form>

              <SubjectPage
                courseId={courseId}
                showCreate={true}
                type="selectable"
                selectedSubjects={selectedSubjects}
                onSelectionChange={setSelectedSubjects}
              />

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}