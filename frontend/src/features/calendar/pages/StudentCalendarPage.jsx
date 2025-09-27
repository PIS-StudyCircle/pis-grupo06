import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import SessionCard from "../components/SessionCard";
import { getSessionsByUser } from "../services/calendarApi";

export default function StudentCalendarPage({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getSessionsByUser(userId)
      .then((data) => {
        // Si el backend devuelve las fechas como strings ISO8601,
        // hay que convertirlas a objetos Date
        const parsed = data.map((s) => ({
          ...s,
          date: new Date(s.date),
        }));
        parsed.sort((a, b) => a.date - b.date);
        setSessions(parsed);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Próximas Sesiones
          </h2>
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
          <h2 className="text-xl font-semibold text-gray-900">
            Próximas Sesiones
          </h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tienes sesiones programadas</p>
          <p className="text-sm text-gray-400 mt-1">
            ¡Agenda una tutoría para comenzar a aprender!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Próximas Sesiones
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {sessions.length}
        </span>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
