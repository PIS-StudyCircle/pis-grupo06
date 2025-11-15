import TutoringCard from "./TutoringCard";
import TutoringCardSkeleton from "./TutoringCardSkeleton";

export default function TutoringList({
  courseName,
  tutorings,
  loading,
  error,
  mode = "",
  onDesuscribirse,
  isBlockingPage,
  setIsBlockingPage,
}) {
  if (loading)  return (
      <div className="flex flex-col">
        {Array.from({ length: 3 }).map((_, i) => (
          <TutoringCardSkeleton key={i} />
        ))}
      </div>
    );
  if (error) return <div>Error al cargar las tutorías. </div>;
  if (!tutorings || tutorings.length === 0)
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
    <div className={`flex flex-col ${isBlockingPage ? "pointer-events-none opacity-50" : ""}`}>
      {tutorings.map((tutoring) => (
        <TutoringCard key={tutoring.id} tutoring={tutoring} onDesuscribirse={onDesuscribirse} isBlockingPage={isBlockingPage}
          setIsBlockingPage={setIsBlockingPage} />
      ))}
    </div>
  );
}
