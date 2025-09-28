import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

export default function SubjectCard({
  subject,
  showCheckbox = false,
  onCheckboxChange,
  checked = false,
}) {
  return (
    <div className="flex items-center justify-between p-2 pl-4 border rounded-md bg-gray-50 text-gray-800 text-sm hover:bg-gray-100 h-15">
      <div className="flex flex-col text-left">
        <span className="font-medium">{subject.name}</span>
        {subject.due_date && (
          <span className="text-gray-500 text-xs">
            Vencimiento: {new Date(subject.due_date).toLocaleDateString("es-ES")}
          </span>
        )}
      </div>

      {!showCheckbox && (
        <Link to={`/temas/${subject.id}`}>
          <button
            type="button"
            className="inline-flex items-center text-gray-700 hover:text-white border border-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-2 py-2"
          >
            <HiArrowRight className="w-5 h-5" />
          </button>
        </Link>
      )}

      {showCheckbox && (
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={checked}
          onChange={(e) => onCheckboxChange?.(subject.id, e.target.checked)}
        />
      )}
    </div>
  );
}
