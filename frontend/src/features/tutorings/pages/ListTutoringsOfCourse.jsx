import { useParams, useNavigate } from "react-router-dom";


export default function ListTutoringsOfCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();


  return (
    
<div className="min-h-screen bg-gray-50 text-gray-900">
  <div className="p-6 max-w-3xl mx-auto">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">
        Tutorías disponibles para el curso {courseId}
      </h1>

      <button
        type="button"
        className="btn"
        onClick={() =>
           navigate(`/tutorias/elegir_temas/estudiante/${courseId}`)
        }
      >
        Solicitar nueva tutoría
      </button>
    </div>

    <div className="mt-4 rounded-lg border border-gray-300 p-4 bg-white">
      <p>Acá se listarían todas las tutorías existentes con tutor asignado</p>
    </div>
  </div>
</div>

    
  );
}
