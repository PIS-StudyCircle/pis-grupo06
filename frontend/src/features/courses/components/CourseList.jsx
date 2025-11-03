import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";

export default function CourseList({ courses, loading, error }) {
  if (loading)  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
  if (error) return <div>Error al cargar las materias. </div>;
  if (courses.length === 0) return <div>No hay materias disponibles. </div>;

  return (
    <div className="flex flex-col">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
    );
}
