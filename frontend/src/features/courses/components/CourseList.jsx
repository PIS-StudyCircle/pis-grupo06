import CourseCard from "./CourseCard";

export default function CourseList({ courses, loading, error }) {
  if (loading) return <div>Cargando materias...</div>;
  if (error) return <div>Error al cargar las materias. </div>;
  if (courses.length === 0) return <div>No hay materias disponibles. </div>;

  return courses.map((course) => <CourseCard key={course.id} course={course} />);
}
