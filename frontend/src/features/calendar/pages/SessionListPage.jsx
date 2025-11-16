import { Calendar } from "lucide-react";
import SessionCard from "../components/SessionCard";
import { useSessions } from "../hooks/useSessions";

export default function SessionList({ userId, type = "upcoming",  isBlockingPage, setIsBlockingPage }) {
  const { sessions = [], loading, refresh } = useSessions(userId, type);

  const emptyMessage =
    type === "finalized"
      ? { title: "No tienes sesiones finalizadas", subtitle: "Cuando finalices alguna tutoría, aparecerá aquí." }
      : type === "upcoming"
      ? { title: "No tienes sesiones programadas", subtitle: "¡Agenda una tutoría para comenzar a aprender!" }
      : type === "my_pendings"
      ? { title: "No tienes sesiones pendientes de confirmación", subtitle: "Cuando crees una nueva tutoría, aparecerá aquí hasta que alguien confirme un horario." }
      : { title: "No tienes sesiones programadas", subtitle: "¡Agenda una tutoría para comenzar a aprender!" };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage.title}</p>
        <p className="text-sm text-gray-400 mt-1">{emptyMessage.subtitle}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 w-full ${isBlockingPage ? "pointer-events-none opacity-50" : ""}`}>
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} type={type} refresh={refresh}isBlockingPage={isBlockingPage}
            setIsBlockingPage={setIsBlockingPage} />
      ))}
    </div>
  );
}
