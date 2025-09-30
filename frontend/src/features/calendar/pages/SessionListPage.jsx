import { Calendar } from "lucide-react";
import SessionCard from "../components/SessionCard";
import { useSessions } from "../hooks/useSessions";
import { useLocation } from "react-router-dom";

export default function SessionList({ userId }) {
  const { sessions, loading, error } = useSessions(userId);
  const location = useLocation();

  // Detectar ruta actual
  const isInbox = location.pathname.includes("/notificaciones")

  const emptyMessage = isInbox
    ? { title: "No tienes invitaciones", subtitle: "Cuando te inviten a una tutoría, aparecerá aquí." }
    : { title: "No tienes sesiones programadas", subtitle: "¡Agenda una tutoría para comenzar a aprender!" };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Próximas Sesiones</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Próximas Sesiones</h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{emptyMessage.title}</p>
          <p className="text-sm text-gray-400 mt-1">{emptyMessage.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 w-full transition">
      <div className="flex items-center gap-2 mb-6 justify-center">
        <h2 className="text-xl font-bold text-gray-800">Próximas Sesiones</h2>
      </div>

      <div className="space-y-4 w-full">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
