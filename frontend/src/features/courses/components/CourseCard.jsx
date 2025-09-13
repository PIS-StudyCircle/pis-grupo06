import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
export default function CourseCard({ course }) {
  return (
    // Enlaza a la página de detalles del curso
    <Link to={`/courses/${course.id}`} className="block">
      <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-2">
        <div className="items-start flex flex-col">
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

        <button
          type="button"
          className="inline-flex items-center text-white hover:text-white border border-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-2 py-2 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer"
        >
          <HiArrowRight className="w-5 h-5" />
        </button>
      </div>
    </Link>
  );
}
