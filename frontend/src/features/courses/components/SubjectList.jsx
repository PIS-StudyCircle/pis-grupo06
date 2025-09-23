import SubjectCard from "./SubjectCard";

export default function SubjectList({ subjects, loading, error, onToggle, selectedSubjects }) {
  if (loading) return <div>Cargando temas...</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;
  if (!subjects || subjects.length === 0) return <div className="text-gray-500">No se han encontrado temas.</div>;

  return (
    <div className="flex flex-col">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          checked={selectedSubjects?.includes(subject.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}