import Footer from "@components/Footer";
import { useSubjectDetail } from "../hooks/useSubjectDetail";
import { TutoringPage } from "@/features/tutorings";
import { useParams } from "react-router-dom";


export default function SubjectDetailPage() {
  const { courseId, subjectId } = useParams();
 
  const { subject, loading, error } = useSubjectDetail(subjectId, courseId);

  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        {loading && (
          <div className="p-6 max-w-3xl mx-auto">Cargando tema...</div>
        )}
        {error && (
          <div className="p-6 max-w-3xl mx-auto text-red-600">
            Error: {error.message}
          </div>
        )}
        {!loading && !error && !subject && (
          <div className="p-6 max-w-3xl mx-auto">No se encontró el tema.</div>
        )}

        {!loading && !error && subject && (
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            {/* Card del tema */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Columna izquierda - info */}
                <div className="md:col-span-2 text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {subject.name}
                  </h1>
                  <div className="space-y-1 pl-[2px]">                   
                    {subject.due_date && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Vencimiento:</span>{" "}
                        {subject.due_date}
                      </p>
                    )}
                  </div>                  
                </div>
              </div>

             {/*El mostrar los temas de la materia se delega a SubjectPage*/}
             <TutoringPage filters={{ subject_id: subject.id }}  showCheckbox = {false} showButton={false} />

            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
