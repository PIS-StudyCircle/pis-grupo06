import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";
export default function CourseCard({ course }) {
  return (
      <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-2">
        <div className="items-start flex flex-col">
          <Link to={`/materias/${course.id}`} className="block">
            <h2 className="text-black font-semibold text-lg hover:underline">
              {course.name}
            </h2>
        </Link>

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
      </div>
  );
}
