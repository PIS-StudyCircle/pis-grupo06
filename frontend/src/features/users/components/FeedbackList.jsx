import { MessageSquare, Calendar } from "lucide-react";

export default function FeedbackList({ feedbacks = [] }) {
  if (!feedbacks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">
          Aún no recibiste feedback de tutorías.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-y-auto max-h-[28rem] scrollbar-thin scrollbar-thumb-gray-300">
      {feedbacks.map((f) => (
        <li
          key={f.id}
          className="flex flex-col gap-1 py-4 px-4 transition-all duration-150 hover:bg-gray-50 rounded-xl"
        >
          {/* Header con curso y fecha */}
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-[#001F54] text-sm md:text-base">
              {f.tutoring.course.name ||"Tutoría sin nombre"}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(f.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Comentario */}
          {f.comment && (
            <p className="text-sm text-gray-700 italic leading-snug">
              “{f.comment}”
            </p>
          )}

          {/* Información del estudiante */}
          {f.student && (
            <p className="text-xs text-gray-500 mt-1">
              De{" "}
              <span className="font-medium text-gray-700">
                {f.student.name} {f.student.last_name}
              </span>{" "}
              ({f.student.email})
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
