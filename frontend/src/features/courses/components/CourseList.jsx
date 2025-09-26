import CourseCard from "./CourseCard";

export default function CourseList({ courses, loading, error }) {
  if (loading) return <div>Cargando materias...</div>;
  if (error) return <div>Error al cargar las materias. </div>;
  if (courses.length === 0) return <div>No hay materias disponibles. </div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
    );
}
