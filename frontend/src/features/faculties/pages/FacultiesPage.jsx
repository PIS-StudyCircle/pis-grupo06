import { useFaculties } from "../hooks/useFaculties";
import { FacultyCard } from "../components/FacultyCard";

export function FacultiesPage() {
  const { faculties } = useFaculties();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        ¿En cuál facultad estás interesado?
      </h1>

      {/* Facultades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {faculties.map((f) => (
          <FacultyCard key={f.id} faculty={f} />
        ))}
      </div>
    </div>
  );
}
