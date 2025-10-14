import TutoringCard from "./TutoringCard";

export default function TutoringList({
  courseName,
  tutorings,
  loading,
  error,
  mode = "",
}) {
  if (loading) return <div>Cargando tutorías...</div>;
  if (error) return <div>Error al cargar las tutorías. </div>;
  if (tutorings.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No hay tutorías disponibles para {courseName || "esta materia"}.
        </h1>

        <p className="text-gray-600 mb-6">
          {mode === "serTutor"
            ? "¡Sé el primero en crear una tutoría para esta materia!"
            : "No hay tutorías disponibles. ¡Solicita una para empezar!"}
        </p>
      </div>
    );

  return (
    <div className="flex flex-col">
      {tutorings.map((tutoring) => (
        <TutoringCard key={tutoring.id} tutoring={tutoring} mode={mode} />
      ))}
    </div>
  );
}
