import TutoringCard from "./TutoringCard";

export default function TutoringList({ tutorings, loading, error, mode = "" }) {
  if (loading) return <div>Cargando tutorías...</div>;
  if (error) return <div>Error al cargar las tutorías. </div>;
  if (tutorings.length === 0) return <div>No hay tutorías disponibles. </div>;

  return(
    <div className="flex flex-col">
      {tutorings.map((tutoring) => (
        <TutoringCard key={tutoring.id} tutoring={tutoring} mode={mode}  />
      ))}
    </div>
    );
}
