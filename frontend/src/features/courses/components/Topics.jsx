import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function CourseTopics({ courseId, subjects = [] }) {
  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Temas</h2>

      {subjects.length > 0 ? (
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between p-2 pl-4 border rounded-md bg-gray-50 text-gray-800 text-sm hover:bg-gray-100"
            >
              <span>{s.name}</span>

              <Link to={`/materias/${courseId}/temas/${s.id}`}>
                <button
                  type="button"
                  className="inline-flex items-center text-gray-700 hover:text-white border border-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-2 py-2"
                >
                  <HiArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 p-3 border rounded-md bg-gray-50 text-sm text-gray-500 text-center">
          Todavía no hay temas asociados
        </div>
      )}
    </div>
  );
}
