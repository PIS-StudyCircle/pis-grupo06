export default function CourseCard({ course }) {
  return (
    <div className="h-auto bg-white rounded-lg shadow p-4 my-4 w-full flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow">
      <h2 className="text-black font-semibold text-lg">{course.name}</h2>

      {course.code && (
        <p className="text-gray-700 text-sm">
          <strong>Código:</strong> {course.code}
        </p>
      )}

      {course.institute && (
        <p className="text-gray-600 text-sm">
          <strong>Instituto:</strong> {course.institute}
        </p>
      )}
    </div>
  );
}
